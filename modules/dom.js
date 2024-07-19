export const $=id=>document.getElementById(id);
// All untrusted hosts, filenames and API results enter the DOM as text nodes.
export function element(tag,text,className) {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
export function empty(container,text) {container.replaceChildren(element('p',text,'empty'));}
export function time(value) {return new Date(value).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});}
export function action(text,callback) {const button=element('button',text);button.type='button';button.onclick=callback;return button;}
