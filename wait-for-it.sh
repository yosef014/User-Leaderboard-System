#!/usr/bin/env sh

# wait-for-it.sh

host="$1"
port="$(echo $host | cut -d: -f2)"
host="$(echo $host | cut -d: -f1)"

shift

until nc -z "$host" "$port"; do
  echo "Waiting for $host:$port..."
  sleep 1
done

exec "$@"