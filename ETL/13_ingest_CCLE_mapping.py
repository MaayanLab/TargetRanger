#%%
import os
import click
import pandas as pd
import psycopg2
from tqdm import tqdm
from df2pg import copy_from_records
import dotenv; dotenv.load_dotenv()


#%%

def load_mapping(con, df, migration=None):
  ''' Load something in normal form:
                 cell_line   DepMap_ID

  '''
  # write data associating entry with the database id
  copy_from_records(con, 'depmap_cell_line_mapping', ('cell_line', 'depmap_id'), (
    dict(
      depmap_id=row['DepMap_ID'],
      cell_line=row['cell_line'],
      # We move description to the index [label, description]
      #  the json will thus be of the form { label: { description: value, ... }, ... }
    )
    for i, row in tqdm(df.iterrows(), total=df.shape[0], desc='Uploading') # progress bar
  ), migration=migration)
  return

#%%
@click.command()
@click.option('-i', '--input', type=click.File('r'), help='tsv file in standard form')
@click.option('-o', '--output', type=click.Path(file_okay=True), help='write the primary key for the ingested database')
@click.option('-m', '--migration', type=bool, is_flag=True, default=False, help='write migration to a output file')
def ingest(input, output, migration):
  con = psycopg2.connect(os.environ['DATABASE_URL'])
  df = pd.read_csv(input, sep='\t')
  with open(output, 'w') as fw:
    load_mapping(con, df, migration=fw if migration else None)

#%%
if __name__ == '__main__':
  ingest()
