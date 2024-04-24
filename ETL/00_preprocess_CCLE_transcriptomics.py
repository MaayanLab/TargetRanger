#%%
import re
import pandas as pd

#%%
sample_info = pd.read_csv('input/CCLE_sample_info.csv')
cell_lines = {
  row['DepMap_ID']: f"{row['primary_disease']} - {row['stripped_cell_line_name']}"
  for _, row in sample_info.iterrows()
}
del sample_info

#%%
df = pd.read_csv('input/CCLE_RNAseq_reads.csv', index_col=0)
expr = re.compile('^(.+?)( \(\w+\))?$')
genes = { gene: expr.match(gene).group(1) for gene in df.columns }

#%%
# TODO: better aggregation strategies
# map cell lines then genes to get non-duplicated mapped index/columns
df = df.groupby(cell_lines, dropna=True, observed=True).first()
df = df.T
df = df.groupby(genes, dropna=True, observed=True).median()

#%%
genes = df.index
labels = ['value']*df.shape[0]
df.index = pd.MultiIndex.from_arrays([genes, labels], names=['gene', 'label'])

#%%
df.to_csv('preprocessed/CCLE_transcriptomics.tsv', sep='\t')

#%%

with open(f'preprocessed/CCLE_mappings.tsv', 'w') as f:
  f.write('DepMap_ID\tcell_line\n')
  for k, v in cell_lines.items():
    cell_line_name = v.split(' - ')[1]
    f.write(f'{k}\t{cell_line_name}\n')

# %%
from maayanlab_bioinformatics.harmonization.ncbi_genes import ncbi_genes_lookup
from maayanlab_bioinformatics.normalization import zscore_normalize, log2_normalize
import matplotlib.pyplot as plt
import qnorm
import numpy as np
from scipy import stats
from tqdm import tqdm
from statsmodels.stats.multitest import multipletests
import re
#%%
background_lookup = ncbi_genes_lookup(organism="Mammalia/Homo_sapiens")


df_bg_stats = pd.read_csv("s3://storage/Tumor_Gene_Target_Screener/gtex-gene-stats.tsv", storage_options=dict(client_kwargs=dict(endpoint_url="https://appyters.maayanlab.cloud"), anon=True), sep='\t', index_col=[0,1])
df_bg_genes = df_bg_stats.unstack().index.map(lambda idx: background_lookup(idx.partition('.')[0]))
df_bg_stats = df_bg_stats.unstack().groupby(df_bg_genes, observed=True).median().stack()
df_bg_expr = df_bg_stats.loc[(slice(None), ['25%', '50%', '75%']), :].unstack()
df_bg_expr

#%%


df_bg_expr = df_bg_expr[[c for c in df_bg_expr.columns if c[1] == '50%']]
# %%
df.index = df.index.get_level_values(0)

df_expr = df


# %%
common_index = list(set(df_expr.index) & set(df_bg_expr.index))
# %%
df_expr = df
target_distribution = df_bg_expr.loc[common_index, :].median(axis=1)
df_expr_norm = qnorm.quantile_normalize(df_expr.loc[common_index, :], target=target_distribution)
df_bg_expr_norm = qnorm.quantile_normalize(df_bg_expr.loc[common_index, :], target=target_distribution)
fig, ((ax11, ax12), (ax21, ax22)) = plt.subplots(2, 2)
log2_normalize(df_expr_norm).median(axis=1).hist(bins=100, ax=ax11)
ax11.set_title('Median Expression')
ax11.set_ylabel('Tumor')
log2_normalize(df_expr_norm).median(axis=0).hist(bins=100, ax=ax12)
ax12.set_title('Median Sample Expression')
log2_normalize(df_bg_expr_norm).median(axis=1).hist(bins=100, ax=ax21)
ax21.set_ylabel('Background')
log2_normalize(df_bg_expr_norm).median(axis=0).hist(bins=100, ax=ax22)
ax21.set_xlabel('$log_2(count)$')
ax22.set_xlabel('$log_2(count)$')
plt.tight_layout()
plt.show()
# %%

cell_line_targets = {}
for cl in tqdm(list(df_expr.columns)):
  res = []
  for g in common_index:
    t_statistic, p_value = stats.ttest_1samp(list(df_bg_expr_norm.loc[g].values), df_expr_norm.loc[g][cl], alternative='less')
    log2fc = np.log2(np.mean(list(df_bg_expr_norm.loc[g].values))) - np.log2(df_expr_norm.loc[g][cl])
    res.append([g, t_statistic, p_value, log2fc])
  gene_df_test = pd.DataFrame(res, columns=['gene', 't_statistic', 'p_value', 'log2fc'])

  reject, pvals_corrected, _, _ = multipletests(gene_df_test['p_value'], method='fdr_bh')
  gene_df_test['p_value_adj'] = pvals_corrected
  sig_targets = gene_df_test[(gene_df_test['p_value_adj'] < 0.01) & (gene_df_test['t_statistic'] < 0) & (gene_df_test['log2fc'] < 2)]
  cell_line_targets[cl] = list(sig_targets['gene'].values)
# %%
import json
with open('all_cell_line_targets.json', 'w') as f:
  json.dump(cell_line_targets, f)

# %%
from scipy.stats import zscore

df_z_log2 = zscore(df, axis=0)
# %%
ts = []
cell_line_targets = {}
for cl in tqdm(list(df_z_log2.columns)):
  targets = df_z_log2[cl][df_z_log2[cl] > 2.23].index.values
  targets = [t[0] for t in targets]
  cell_line_targets[cl] = targets
  ts.append(len(targets))

print(np.mean(ts), np.std(ts))

# %%
import json
with open('cell_line_targets_zscored.json', 'w') as f:
  json.dump(cell_line_targets, f)
# %%
