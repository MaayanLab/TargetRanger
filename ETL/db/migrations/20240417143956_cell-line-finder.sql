-- migrate:up

create or replace function cell_line_ppc_vectorized(a_mean double precision[], input_background data_complete[], cell_line_target varchar) returns cell_line_results[] as $$
  import numpy as np
  import json

  cell_lines_dict = {}

  gene_order = []
  print(input_background[0].keys())
  for d in input_background:
    input_bg_data = json.loads(d['values'])
    expr = input_bg_data['value']
    gene = d['gene']
    for cl in expr:
      if cell_line_target == 'All':
        if cl not in cell_lines_dict:
            cell_lines_dict[cl] = []
        cell_lines_dict[cl].append(expr[cl])
      else:
        if cl.split(' - ')[0] == cell_line_target:
          if cl not in cell_lines_dict:
            cell_lines_dict[cl] = []
          cell_lines_dict[cl].append(expr[cl])

  result = []
  for cell_line in cell_lines_dict:
      result.append((cell_line, np.corrcoef(np.log(np.array(a_mean) + 1), np.log(np.array(cell_lines_dict[cell_line]) + 1))[0][1]))

  return result
$$ language plpython3u immutable;

create or replace function screen_cell_lines_vectorized(input_data jsonb, background varchar, cell_line_target varchar) returns setof cell_line_results as $$
  with
  input_data_each as (
    select
      j.key as gene,
      j.value || jsonb_build_object('count', input_data->'n') as values
    from jsonb_each(input_data->'genes') as j
  ),
  input_background as (
    select
      input_data_each.gene,
      input_data_each.values as input_data,
      data_complete as background_data,
      row_number() over () / 1000 as group_number  -- Change 1000 to your desired chunk size
    from input_data_each
    inner join gene on gene.gene = input_data_each.gene
    inner join data_complete on data_complete.gene = gene.gene
    where data_complete.dbname = background
  ),
  vectorized_stats as (
    select
      group_number,
      cell_line_ppc_vectorized(
        array_agg((input_data->>'mean')::double precision),
        array_agg((background_data)::data_complete),
        cell_line_target
      ) as value
    from input_background
    group by group_number
  ),
  stats as (
    select r.*
    from
      vectorized_stats,
      unnest(vectorized_stats.value) r
    where
      r.pcc >= 0
  )
select *
from stats
$$ language sql immutable;
-- migrate:down

