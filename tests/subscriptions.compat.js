import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import React,{act} from 'react';
import {ProviderHub} from '../lib/client.js';
import {setup} from './ui-fixture.js';
if (!process.env.SUBSCRIPTIONS_SOURCE || !process.env.DSH_SOURCE) throw new Error('Set SUBSCRIPTIONS_SOURCE to an unpacked dsh-plugin-subscriptions package and DSH_SOURCE to a built Harness checkout.');
registerHooks({resolve(s,c,next){if(['react','react/jsx-runtime'].includes(s))return {url:pathToFileURL(resolve(s==='react'?'node_modules/react/index.js':'node_modules/react/jsx-runtime.js')).href,shortCircuit:true};return next(s,c);}});
const {SubscriptionsSection}=await import(pathToFileURL(resolve(process.env.SUBSCRIPTIONS_SOURCE,'lib/client/SubscriptionsSection.js')).href);
const {SlotCore}=await import(pathToFileURL(resolve(process.env.DSH_SOURCE,'packages/client/ui-slots/lib/index.js')).href);
function setupReal(entries) {const slots=new SlotCore();slots.register({name:'root',children:{'settings.section':{kind:'list',scope:'root'}}},()=>null);for(const e of entries)slots.register(e.options,e.component);return setup(entries,slots);}
test('embeds the installed 0.9.7 subscription component and its real RPC injection',async()=>{
 const calls=[];const providers=Object.fromEntries(['codex','claude','grok','copilot','antigravity'].map(p=>[p,{accounts:[],busy:false}]));
 const rpc={call:async(channel,method,payload)=>{calls.push({channel,method,payload});return{ok:true,value:method.endsWith('.status')?{providers}:method.endsWith('.proxyGet')?{enabled:false}:method.endsWith('.modelDefaults')?[]:method.endsWith('.login')?{authorizeUrl:payload.provider==='copilot'?'https://github.com/login/device':'https://auth.openai.com/test',...(payload.provider==='copilot'?{userCode:'TEST-CODE'}:{})}:{busy:false}};}};
 const f=setupReal([{options:{name:'settings.section',id:'subscriptions',inject:()=>({rpc})},component:SubscriptionsSection}]);
 try{
 await act(async()=>f.root.render(React.createElement(ProviderHub,{controller:f.controller,slots:f.slots})));
 await act(async()=>f.button('Manage subscription sign-in').click());
 assert.match(document.body.textContent,/Codex \(ChatGPT\)/);assert.match(document.body.textContent,/GitHub Copilot/);
 assert.ok(calls.some(c=>c.method==='subscriptions-auth.status'));
 const connect=[...document.querySelectorAll('button')].find(b=>b.textContent==='Log in');assert.ok(connect);
 const opened=[];window.open=url=>opened.push(url);
 await act(async()=>connect.click());
 assert.deepEqual(opened,['https://auth.openai.com/test']);
 assert.ok(calls.some(c=>c.method==='subscriptions-auth.login' && c.payload.provider==='codex'));
 const copilotName=[...document.querySelectorAll('span')].find(span=>span.textContent==='GitHub Copilot');
 const copilotLogin=[...copilotName.parentElement.parentElement.querySelectorAll('button')].find(b=>b.textContent==='Log in');
 await act(async()=>copilotLogin.click());
 assert.ok(calls.some(c=>c.method==='subscriptions-auth.login' && c.payload.provider==='copilot'));
 assert.match(document.body.textContent,/TEST-CODE/);
 await act(async()=>f.button('Hide subscription sign-in').click());
 assert.ok(!document.body.textContent.includes('Codex (ChatGPT)'));
 }finally{await act(async()=>f.root.unmount());f.dom.window.close();}
});
