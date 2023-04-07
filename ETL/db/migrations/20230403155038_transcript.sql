-- migrate:up


create extension if not exists "uuid-ossp";




create table transcript (
  id uuid primary key default uuid_generate_v4(),
  transcript varchar
);

create table data_transcript (
  id serial primary key,
  database uuid not null references database (id) on delete cascade,
  transcript uuid not null references transcript (id) on delete cascade,
  values jsonb not null,
  unique (database, transcript)
);

CREATE OR REPLACE VIEW data_complete AS
SELECT
    database.dbname AS dbname,
    gene.gene AS gene,
    COALESCE(data.values, data_transcript.values) AS values,
    transcript.transcript AS transcript
FROM
    database
LEFT JOIN data ON data.database = database.id
LEFT JOIN gene ON data.gene = gene.id
LEFT JOIN data_transcript ON data_transcript.database = database.id
LEFT JOIN transcript ON data_transcript.transcript = transcript.id;


DROP MATERIALIZED VIEW IF EXISTS database_agg;

CREATE MATERIALIZED VIEW IF NOT EXISTS database_agg AS
SELECT
    data.id AS id,
    data.database AS database,
    data.gene AS gene,
    NULL::uuid AS transcript,
    aggregate_stats(data.values) AS values
FROM data
UNION ALL
SELECT
    data_transcript.id AS id,
    data_transcript.database AS database,
    NULL::uuid AS gene,
    data_transcript.transcript AS transcript,
    aggregate_stats(data_transcript.values) AS values
FROM data_transcript;

CREATE TABLE gene_transcript (
    gene uuid NOT NULL REFERENCES gene (id) ON DELETE CASCADE,
    transcript uuid NOT NULL REFERENCES transcript (id) ON DELETE CASCADE,
    PRIMARY KEY (gene, transcript)
);

-- migrate:down

drop view data_complete_transcript;
drop table transcript;
drop table data_transcript;
drop table gene_transcript;



