FROM postgres:15.6
RUN set -x \
  && apt-get update \
  && apt-get -y install python3 python3-pip postgresql-plpython3-15 \
  && pip install scipy numpy statsmodels --break-system-packages
