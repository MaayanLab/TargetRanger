# Target Ranger Kubernetes Deployment

<https://github.com/maayanLab/targetranger/>

This helm chart can be used to deploy targetranger and its python-extension available postgres database on kubernetes.

```bash
helm install targetranger charts/targetranger
```

## Load DB
```bash
# export local db
pg_dump -Fc --no-acl --no-owner $(dotenv get DATABASE_URL) > preprocessed/db.dump

# import to remote db
kubectl exec -it deploy/targetranger-db -- pg_restore -h localhost -cO --if-exists -d postgres -U postgres -w < preprocessed/db.dump
```
