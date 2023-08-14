
curl --location --request PUT 'http://os01:9200/_cluster/settings' \
    --header 'Content-Type: application/json' \
    --data-raw '{ "transient": { "cluster.routing.allocation.disk.watermark.low": "93%","cluster.routing.allocation.disk.watermark.high": "95%" } }' &
curl --location --request PUT 'http://os01:9200/.kibana_1/_alias/.kibana'

