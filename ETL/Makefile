# COMMANDS (make [command])

.PHONY: ensure-db
ensure-db: check-deps ensure-dotenv
	dbmate wait
	dbmate up

.PHONY: pg-shell
pg-shell: check-deps ensure-db
	psql $(shell uv run dotenv get DATABASE_URL)

.PHONY: pg-dump
pg-dump: check-deps ensure-db
	mkdir -p preprocessed
	pg_dump -Fc --no-acl --no-owner $(shell uv run dotenv get DATABASE_URL) > preprocessed/db.dump

.PHONY: create-db
create-db: ensure-dotenv
	docker compose up -d targetranger-db-2

.PHONY: docker-pg-shell
docker-pg-shell: check-deps ensure-db
	docker compose exec targetranger-db-2 psql $(shell uv run dotenv get DATABASE_URL)


# INPUT FILES

## NCBI descriptions
input/Homo_sapiens.gene_info.gz:
	mkdir -p input
	curl -L -o $@ https://ftp.ncbi.nlm.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz

## NCBI Summaries
input/Homo_sapiens.gene_summary.tsv: input/Homo_sapiens.gene_info.gz
	mkdir -p input
	uv run 05_fetch_summary_from_gene_info.py -i $^ -o $@

## CCLE proteomics
input/protein_quant_current_normalized.csv.gz:
	mkdir -p input
	curl -L -o $@ https://gygi.hms.harvard.edu/data/ccle/protein_quant_current_normalized.csv.gz

## CCLE transcriptomics: https://depmap.org/portal/download/
input/CCLE_RNAseq_reads.csv:
	mkdir -p input
	curl -L -o $@ https://ndownloader.figshare.com/files/34989958
input/CCLE_sample_info.csv:
	mkdir -p input
	curl -L -o $@ https://ndownloader.figshare.com/files/35020903

## GTEx transcriptomics:
input/gtex-gene-stats.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/gtex-gene-stats.tsv

## ARCHS4:
input/archs4-gene-stats-clean.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/archs4-gene-stats-clean.tsv

## Tabula Sapiens
input/ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv

## HPM
input/hpm.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/hpm.tsv

## HPA
input/hpa.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/hpa.tsv

## GTEx proteomics
input/gtex_proteomics.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/gtex_proteomics.tsv

## GTEx transcript stats
input/gtex-transcript-stats.tsv:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/gtex-transcript-stats.tsv

## ARCHS4 transcript stats
input/archs4-transcript-stats-clean.tsv.gz:
	mkdir -p input
	curl -L -o $@ https://appyters.maayanlab.cloud/storage/Tumor_Gene_Target_Screener/archs4-transcript-stats-clean.tsv.gz

.PHONY: fetch
fetch: input/Homo_sapiens.gene_info.gz input/Homo_sapiens.gene_summary.tsv input/protein_quant_current_normalized.csv.gz input/CCLE_RNAseq_reads.csv input/CCLE_sample_info.csv input/gtex-gene-stats.tsv input/archs4-gene-stats-clean.tsv input/ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv input/hpm.tsv input/hpa.tsv input/gtex_proteomics.tsv input/gtex-transcript-stats.tsv input/archs4-transcript-stats-clean.tsv.gz


# PREPROCESS
preprocessed/Homo_sapiens.gene_info.complete.tsv: input/Homo_sapiens.gene_info.gz input/Homo_sapiens.gene_summary.tsv
	mkdir -p preprocessed/
	uv run 06_preprocess_gene_info.py

preprocessed/hpa.tsv: input/hpa.tsv
	mkdir -p preprocessed/
	uv run 00_preprocess_hpa.py

preprocessed/hpm.tsv: input/hpm.tsv
	mkdir -p preprocessed/
	uv run 00_preprocess_hpm.py

preprocessed/gtex_proteomics.tsv: input/gtex_proteomics.tsv
	mkdir -p preprocessed/
	uv run 00_preprocess_gtex_proteomics.py

preprocessed/CCLE_transcriptomics.tsv: input/CCLE_RNAseq_reads.csv input/CCLE_sample_info.csv
	mkdir -p preprocessed/
	uv run 00_preprocess_CCLE_transcriptomics.py

preprocessed/CCLE_proteomics.tsv: input/protein_quant_current_normalized.csv.gz
	mkdir -p preprocessed/
	uv run 00_preprocess_CCLE_proteomics.py

preprocessed/ARCHS4_transcript.tsv: input/archs4-transcript-stats-clean.tsv.gz
	mkdir -p preprocessed/
	gunzip -f

.PHONY: preprocess
preprocess: preprocessed/Homo_sapiens.gene_info.complete.tsv preprocessed/hpa.tsv preprocessed/hpm.tsv preprocessed/gtex_proteomics.tsv preprocessed/CCLE_transcriptomics.tsv preprocessed/CCLE_proteomics.tsv


# INGEST
ingest/gene_info: preprocessed/Homo_sapiens.gene_info.complete.tsv
	make ensure-db
	mkdir -p ingest
	uv run 10_ingest_gene_info.py && touch ingest/gene_info

ingest/ARCHS4: input/archs4-gene-stats-clean.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n ARCHS4 -i $< -o $@

ingest/GTEx_transcriptomics: input/gtex-gene-stats.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n GTEx_transcriptomics -i $< -o $@

ingest/Tabula_Sapiens: input/ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n Tabula_Sapiens -i $< -o $@

ingest/HPM: preprocessed/hpm.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n HPM -i $< -o $@

ingest/HPA: preprocessed/hpa.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n HPA -i $< -o $@

ingest/GTEx_proteomics: preprocessed/gtex_proteomics.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n GTEx_proteomics -i $< -o $@

ingest/CCLE_Transcriptomics: preprocessed/CCLE_transcriptomics.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n CCLE_transcriptomics -i $< -o $@

ingest/CCLE_Proteomics: preprocessed/CCLE_proteomics.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n CCLE_proteomics -i $< -o $@

ingest/GTEx_transcript: input/gtex-transcript-stats.tsv
	make ensure-db
	mkdir -p ingest
	uv run 12_ingest_standard_form_transcript.py -n GTEx_transcript -i $< -o $@

ingest/ARCHS4_transcript: input/archs4-transcript-stats-clean.tsv.gz
	make ensure-db
	mkdir -p ingest
	uv run 12_ingest_standard_form_transcript.py -n ARCHS4_transcript -i $< -o $@

ingest/ARCHS4.sql: input/archs4-gene-stats-clean.tsv.gz
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n ARCHS4 -i $< -o $@ -m

ingest/ARCHS4_norm.sql: input/archs4-gene-stats-norm-clean.tsv.gz
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n ARCHS4_norm -i $< -o $@ -m

ingest/GTEx_transcriptomics.sql: input/gtex-gene-stats.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n GTEx_transcriptomics -i $< -o $@ -m

ingest/Tabula_Sapiens.sql: input/ts_10x_cell-ontology-class_donors_tissue-labels_v1.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n Tabula_Sapiens -i $< -o $@ -m

ingest/HuBMAP.sql: input/hubmap_full_reference_matrix_cleaned.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n HuBMAP -i $< -o $@ -m

ingest/HPM.sql: preprocessed/hpm.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n HPM -i $< -o $@ -m

ingest/HPA.sql: preprocessed/hpa.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n HPA -i $< -o $@ -m

ingest/GTEx_proteomics.sql: preprocessed/gtex_proteomics.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n GTEx_proteomics -i $< -o $@ -m

ingest/CCLE_Transcriptomics.sql: preprocessed/CCLE_transcriptomics.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n CCLE_transcriptomics -i $< -o $@ -m

ingest/CCLE_Proteomics.sql: preprocessed/CCLE_proteomics.tsv
	make ensure-db
	mkdir -p ingest
	uv run 11_ingest_standard_form.py -n CCLE_proteomics -i $< -o $@ -m

ingest/GTEx_transcript.sql: input/gtex-transcript-stats.tsv
	make ensure-db
	mkdir -p ingest
	uv run 12_ingest_standard_form_transcript.py -n GTEx_transcript -i $< -o $@ -m

ingest/ARCHS4_transcript.sql: input/archs4-transcript-stats-clean.tsv.gz
	make ensure-db
	mkdir -p ingest
	uv run 12_ingest_standard_form_transcript.py -n ARCHS4_transcript -i $< -o $@ -m

.PHONY: ingest
ingest: ingest/gene_info ingest/ARCHS4 ingest/GTEx_transcriptomics ingest/Tabula_Sapiens ingest/HPM ingest/HPA ingest/GTEx_proteomics ingest/CCLE_Transcriptomics ingest/CCLE_Proteomics ingest/GTEx_transcript ingest/ARCHS4_transcript

# MISC

../.env: ../.env.example
	test -f ../.env || cp ../.env.example ../.env

.env: ../.env
	test -f .env || ln -s ../.env .

.PHONY: check-deps
check-deps:
	@which dbmate > /dev/null || (echo "Install dbmate, see https://github.com/amacneil/dbmate" && exit 1)
	@which curl > /dev/null || (echo "Install curl, see https://curl.se/" && exit 1)
	@which uv > /dev/null || (echo "Install uv, see https://docs.astral.sh/uv/" && exit 1)

.PHONY: ensure-dotenv
ensure-dotenv: .env
	@uv run dotenv get POSTGRES_PASSWORD || uv run dotenv -qauto set POSTGRES_PASSWORD $(shell openssl rand -hex 16)
	uv run dotenv -qauto set DATABASE_URL postgres://$(shell uv run dotenv get POSTGRES_USER):$(shell uv run dotenv get POSTGRES_PASSWORD)@$(shell uv run dotenv get POSTGRES_HOST):5432/$(shell uv run dotenv get POSTGRES_DB)?sslmode=disable

.venv:
	uv venv --python=3.11 --allow-existing || rm -r .venv
	uv pip install -r requirements.txt || rm -r .venv

.PHONY: docker-pg-dump
docker-pg-dump: preprocessed/db.dump

preprocessed/db.dump:
	mkdir -p preprocessed
	docker compose exec -T target-ranger-db-2 pg_dump -Fc --no-acl --no-owner $(shell uv run dotenv get DATABASE_URL) > preprocessed/db.dump

.PHONY: dokku-import
dokku-import: preprocessed/db.dump
	ssh -T dokku@ssh.dev.maayanlab.cloud postgres:import generanger < preprocessed/db.dump
	rm preprocessed/db.dump
