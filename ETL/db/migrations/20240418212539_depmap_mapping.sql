-- migrate:up

create table depmap_cell_line_mapping (
  cell_line varchar,
  depmap_id varchar
);

create index depmap_cell_line_mapping_cell_line_idx on depmap_cell_line_mapping(cell_line);

-- migrate:down

drop table depmap_cell_line_mapping;

