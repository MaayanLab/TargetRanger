#%%
import os
import re
import json
import click
import numpy as np
import pandas as pd
import psycopg2
from tqdm import tqdm
from df2pg import copy_from_records
import dotenv; dotenv.load_dotenv()


#%%
migration = open('ingest/map_genes.sql', 'w')
con = psycopg2.connect(os.environ['DATABASE_URL'])
  
# collect genes/ids
with con.cursor() as cur:
  cur.execute('select id, gene from gene')
  gene_lookup = {gene: id for id, gene in cur.fetchall()}

# collect transcript/ids
with con.cursor() as cur:
  cur.execute('select id, transcript from transcript')
  transcript_lookup = {transcript: id for id, transcript in cur.fetchall()}

# find the transcripts that are already mapped
with con.cursor() as cur:
  cur.execute('select transcript from mapper')
  transcripts_mapped = [transcript[0] for transcript in cur.fetchall()]


df_transcript_gene_map = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/genes-transcript-mapping.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', header=0)
gene_transcript_mapping = []
genes_set = set()

unmapped = set(transcript_lookup.keys()).difference(set(transcripts_mapped))
for t in tqdm(unmapped):
  if transcript_lookup[t] not in transcripts_mapped:
    g_row = df_transcript_gene_map[df_transcript_gene_map['Transcript stable ID'] == t]
    g = g_row['Gene name'].values
    g_ensem = g_row['Gene stable ID'].values
    if len(g) > 0 and not pd.isna(g[0]):
      gene_transcript_mapping.append([g[0], t])
      genes_set.add(g[0])
    elif len(g_ensem) > 0:
      gene_transcript_mapping.append([g_ensem[0], t])
      genes_set.add(g_ensem[0])

copy_from_records(con, 'gene', ('gene',), (
dict(gene=gene)
for gene in genes_set.difference(set(gene_lookup.keys()))
), migration=migration)


# collect complete genes/ids
with con.cursor() as cur:
  cur.execute('select id, gene from gene')
  gene_lookup = {gene: id for id, gene in cur.fetchall()}

# write data associating entry with the database id
copy_from_records(con, 'gene_transcript', ('gene', 'transcript'), (
  dict(
    gene=gene_lookup[mapping[0]],
    transcript=transcript_lookup[mapping[1]],
    # We move description to the index [label, description]
    #  the json will thus be of the form { label: { description: value, ... }, ... }
  )
  for mapping in tqdm(gene_transcript_mapping, total=len(gene_transcript_mapping), desc='Uploading') # progress bar
), migration=migration)


