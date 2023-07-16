echo "Waiting for MongoDB to start..."
sleep 10  # Waits 10 seconds
echo "Setting up replica set..."
mongo --eval 'rs.initiate({_id : "rs0", members: [{ _id: 0, host: "localhost:27017" }]})'
echo "Replica set configured"