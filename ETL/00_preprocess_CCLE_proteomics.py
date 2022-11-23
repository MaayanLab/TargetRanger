#%%
import re
import pandas as pd

#%%
df = pd.read_csv('input/protein_quant_current_normalized.csv.gz', compression='gzip')
# 48: is where the tissues start, don't need anything else (apparently TODO)
genes = df['Gene_Symbol']
labels = ['value']*df.shape[0]
df = df.iloc[:, 48:]
# capture genes on the index
df.index = pd.MultiIndex.from_arrays([genes, labels], names=['gene', 'label'])
# rename format column names
expr = re.compile(r'^(?P<cell_line>[^_]+)_(?P<tissue>[^_]+)_.+$')
df.columns = [
  f"{m['cell_line']} - {m['tissue']}"
  for col in df.columns
  for m in (expr.match(col),)
]

#%%
# aggregate duplicated gene names
df = df.reset_index().groupby(['gene', 'label'], observed=True, dropna=True).max()

#%%
df.to_csv('preprocessed/CCLE_proteomics.tsv', sep='\t')
