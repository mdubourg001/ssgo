    echo "Installing deno..."
    curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.3.3
    export PATH="/opt/buildhome/.deno/bin:$PATH" 

    echo "Installing ssgo..."
    deno install -f --unstable --no-check --allow-read --allow-write --allow-net https://deno.land/x/ssgo/ssgo.ts 
    
    echo "Building docs website..."
    ssgo --sitemap=https://ssgo.netlify.app 

    echo "Copying some files to dist/..."
    cp _redirects robots.txt dist/