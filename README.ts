# Allow connections from any IP address (for testing)
host    all             all             0.0.0.0/0               md5

# Or for IPv6
host    all             all             ::/0                    md5

# Allow local connections
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
