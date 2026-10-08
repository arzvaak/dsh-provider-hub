import {build} from 'esbuild';
await build({entryPoints:['src/client.jsx'],outfile:'lib/client.js',bundle:true,format:'esm',platform:'browser',target:'es2022',jsx:'automatic',external:['react','react/jsx-runtime','react-dom'],legalComments:'eof'});
