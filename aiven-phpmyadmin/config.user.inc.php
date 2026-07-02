<?php
/* Points phpMyAdmin at the managed Aiven MySQL instance instead of the
 * local dev `db` container. Connection details are read from
 * backend/.env (loaded via docker-compose `env_file`) so credentials
 * never need to be duplicated into this repo. */

$dbSslCa = getenv('DB_SSL_CA');
if ($dbSslCa) {
    $caPath = '/tmp/aiven-ca.pem';
    file_put_contents($caPath, str_replace('\n', "\n", $dbSslCa));
    $cfg['Servers'][$i]['ssl_ca'] = $caPath;
    $cfg['Servers'][$i]['ssl'] = true;
    $cfg['Servers'][$i]['ssl_verify'] = true;
}

$cfg['Servers'][$i]['host'] = getenv('DB_HOST');
$cfg['Servers'][$i]['port'] = getenv('DB_PORT');
$cfg['Servers'][$i]['verbose'] = 'Aiven MySQL';
