default:
    parallel -j 2 just ::: serve watch

serve:
    live-server dist

watch:
    esbuild --bundle --loader:.html=copy --outdir=dist --format=esm --watch=forever --sourcemap src/main.ts index.html

build:
    esbuild --minify --bundle --loader:.html=copy --outdir=dist --format=esm src/main.ts index.html

zip: build
    advzip pack.zip -a dist/index.html dist/main.js

linecount:
    find src/ -name '*.ts' | xargs wc -lc