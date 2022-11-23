#%%
import os
import click
import numpy as np
import pandas as pd
import psycopg2
from tqdm import tqdm
from df2pg import copy_from_records
import dotenv; dotenv.load_dotenv()

#%%
def aggregate_standard(df):
  raise NotImplementedError(df)

def load_standard(con, df, name):
  ''' Load something in normal form:
                 description1   description2
  gene1  label1  ...
         label2  ...
  '''
  # reshape data
  # label things for easy access
  df.index.names = ['gene', 'label']
  df.columns.name = 'description'
  # [(gene, label), description] => [gene, (description, label)]
  df = df.unstack('label')

  # load ncbi genes to do gene mapping
  with con.cursor() as cur:
    cur.execute('''
      select symbol, string_agg(gene_info_xref.xref, '\t')
      from gene_info
      left join gene_info_xref on gene_info.id = gene_info_xref.id
      group by gene_info.id;
    ''')
    # TODO: worry about duplicate mappings
    ncbi_genes = {
      xref: symbol
      for symbol, xrefs in cur.fetchall()
      for xref in [symbol] + (xrefs.split('\t') if xrefs else [])
    }

  # map our genes with aggregation
  #  step 1 { current_gene: mapped_gene, ... }
  gene_mapping = {gene: ncbi_genes.get(gene, gene) for gene in df.index}

  #  step 2 { mapped_gene: [current_gene, ...] }
  gene_mapping_inv = {}
  for gene, mapping in gene_mapping.items():
    if mapping not in gene_mapping_inv: gene_mapping_inv[mapping] = []
    gene_mapping_inv[mapping].append(gene)

  #  step 3 reconstruct df, aggregating & renaming columns
  mapped = {} # { mapped_gene: new_d }
  for mapping, genes in tqdm(gene_mapping_inv.items(), desc='Augmenting'):
    if 'value' in df.columns.get_level_values('label'):
      # qualitative
      if len(genes) == 1:
        gene, = genes
        new_d = df.loc[gene, :].unstack('label')
      else:
        # TODO: come up with better agg scheme for qualitative data
        new_d = df.loc[genes[0], :].unstack('label')
      mapped[mapping] = new_d.stack('label')
    else:
      # quantitative
      if len(genes) == 1:
        gene, = genes
        new_d = df.loc[gene, :].unstack('label')
        new_d.rename({
          '25%': 'q1',
          '50%': 'median',
          '75%': 'q3',
        }, axis=1, inplace=True)
      else:
        # [gene, (description, label)] => [gene, (label, description)]
        d = df.loc[genes, :].stack('description').unstack('description')
        # d[label] results in [gene, description]
        new_d = pd.DataFrame({
          'min': d['min'].min(),
          'max': d['max'].max(),
          'count': d['count'].sum(),
          # weighted sums
          'q1': (d['25%'] * d['count']).sum() / d['count'].sum(),
          'median': (d['50%'] * d['count']).sum() / d['count'].sum(),
          'q3': (d['75%'] * d['count']).sum() / d['count'].sum(),
          'mean': (d['mean'] * d['count']).sum() / d['count'].sum(),
        })
        new_d.columns.name = 'label'
      IRQ = new_d['q3'] - new_d['q1']
      new_d['lowerfence'] = np.minimum(new_d['q1'] - 1.5*IRQ, new_d['min'])
      new_d['upperfence'] = np.maximum(new_d['q3'] + 1.5*IRQ, new_d['max'])
      mapped[mapping] = new_d.stack('label')

  # assemble augmented dataframe
  df = pd.concat(mapped, copy=False, axis=1).T
  df.index.name = 'gene'
  
  # find existing genes already registered in the db
  with con.cursor() as cur:
    cur.execute('select gene from gene')
    existing_genes = {gene for gene, in cur.fetchall()}
  # here we add only "new" genes
  copy_from_records(con, 'gene', ('gene',), (
    dict(gene=gene)
    for gene in (gene_mapping_inv.keys() - existing_genes)
  ))
  # obtain now-complete gene lookup from gene symbol to db id
  with con.cursor() as cur:
    cur.execute('select id, gene from gene')
    gene_lookup = {gene: id for id, gene in cur.fetchall()}

  # register database, get an id
  with con.cursor() as cur:
    cur.execute('insert into database (dbname) values (%s) returning id', (name,))
    database_id, = cur.fetchone()

  # write data associating entry with the database id
  copy_from_records(con, 'data', ('database', 'gene', 'values'), (
    dict(
      database=database_id,
      gene=gene_lookup[gene],
      # We move description to the index [label, description]
      #  the json will thus be of the form { label: { description: value, ... }, ... }
      values=values.unstack('label').to_json(), 
    )
    for gene, values in tqdm(df.iterrows(), total=df.shape[0], desc='Uploading') # progress bar
  ))
  return database_id

#%%
@click.command()
@click.option('-i', '--input', type=click.File('r'), help='tsv file in standard form')
@click.option('-n', '--name', type=str, help='name to use in the database')
@click.option('-o', '--output', type=click.Path(file_okay=True), help='write the primary key for the ingested database')
def ingest(input, name, output):
  con = psycopg2.connect(os.environ['DATABASE_URL'])
  df = pd.read_csv(input, sep='\t', index_col=[0, 1])
  database_id = load_standard(con, df, name)
  with open(output, 'w') as fw:
    fw.write(database_id)

#%%
if __name__ == '__main__':
  ingest()