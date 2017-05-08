isplain     = (o) -> !!o && typeof o == 'object' && o.constructor == Object
isstring    = (s) -> typeof s == 'string'
isprimitive = (a) -> typeof a in ['boolean', 'number', 'string', 'symbol']
isfunction  = (s) -> typeof s == 'function'
nnot        = (f) -> (a...) -> !f(a...)
mixin       = (os...) -> r = {}; r[k] = v for k, v of o for o in os; r
splitcm     = (s) -> s.split ','
merge       = (t, os...) -> t[k] = v for k,v of o for o in os; t
mixin       = (os...) -> merge {}, os...
apply       = (fn) -> (args) -> fn.apply this, args
keyval      = (k, v) -> o = {}; o[k] = v; o
ktrue       = (k) -> keyval k, true
map = (f) -> (as) ->
    r = Array(as.length); len = as.length; i = 0
    `for (;i < len; ++i) { r[i] = f(as[i]) }`
    r
each = (f) -> (as) ->
    len = as.length; i = 0
    `for (;i < len; ++i) { f(as[i]) }`
    undefined
filter = (f) -> (as) ->
    r = []
    ri = -1
    (r[++ri] = v if f(v)) for v in as
    r

# boolean attributes (including html for DOCTYPE) from https://html.spec.whatwg.org/#attributes-3
bool = apply(mixin) map(ktrue) splitcm 'allowfullscreen,async,autofocus,\
autoplay,checked,controls,default,defer,disabled,formnovalidate,hidden,ismap,\
itemscope,loop,multiple,muted,novalidate,open,readonly,required,reversed,scoped,\
seamless,selected,sortable,typemustmatch,html,webview'

# escape text
esc   = (s = '') -> String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
# escape attributes
esca  = (s) -> esc(s).replace(/"/g,'&quot;')
# turn an array of mixed string/object to attributes
attr  = (k, v) ->
    if bool[k] then (if v then "#{esca(k)}" else '') else "#{esca(k)}=\"#{esca(v)}\""
attrs = (a) -> (attr(k,v) for k, v of a).join(' ')

# unwrapper for nested content function
unnest = (bind) -> _unnest = (f) ->
    if isfunction f
        _unnest f.call(bind)
    else if isprimitive(f)
        out.text String(f)

# global output when rendering, set vi capture()
out = null

onlyplain = filter(isplain)
noplain = filter(nnot isplain)
asfun = (a) -> if isfunction(a) then a else (->a)

oneobj = (as) -> apply(mixin) onlyplain as
asfuns = (as) -> map(asfun) noplain as

# creates a tag
tag = (name, vod) -> tagf = (args...) ->

    # outmost tag sets up / tears down a StringOut
    return capture(new StringOut, tagf, args) unless out

    objs = oneobj args
    funs = asfuns args

    out.begin name, vod, objs
    each(unnest(this)) funs
    out.close name unless vod
    undefined

pass = (args...) ->
    return capture(new StringOut, pass, args) unless out
    each(unnest(this)) asfuns args
    undefined

# default output, as string
class StringOut
    constructor: ->
        @buf = []
    start: ->
    begin: (name, vod, props) ->
        @buf.push "<#{name}" + (if (a = attrs(props)).length then " " + a else "") + ">"
    text: (t) ->
        @buf.push esc(t)
    close: (name) ->
        @buf.push "</#{name}>"
    end: -> @buf.join('')

# capture the output for the given tag function applying args
capture = (_out, tagf, args) ->
    try
        out = _out
        out.start()
        apply(tagf) args ? []
    finally
        out = null
    _out.end()

# helper to make tags
maketag = (vod) -> (n) -> keyval n, tag(n, vod)

# ############ LIST OF DEFINED TAGS
# html5 normal elements, copied from https://developer.mozilla.org/en/docs/Web/HTML/Element
elems = apply(mixin) map(maketag()) splitcm 'html,head,style,title,address,\
article,body,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,blockquote,\
dd,div,dl,dt,figcaption,figure,li,main,ol,p,pre,ul,a,abbr,b,bdi,\
bdo,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,\
time,u,var,audio,map,video,iframe,object,canvas,noscript,script,del,ins,caption,colgroup,\
table,tbody,td,tfoot,th,thead,tr,button,datalist,fieldset,form,label,legend,meter,optgroup,\
option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,\
decorator,element,shadow,template'

# void elements, see http://stackoverflow.com/questions/3558119#answer-3558200
vods = apply(mixin) map(maketag true) splitcm 'area,base,br,col,embed,hr,img,input,\
keygen,link,meta,param,source,track,wbr'

html5 = (as...) ->
    tag('!DOCTYPE', true) html:true, '\n', -> tags.html as...

# the exported tags (and functions)
tags = mixin {tag, capture, pass, html5}, elems, vods

if typeof module == 'object'
    module.exports = tags
else if typeof define == 'function' and define.amd
    define -> tags
else
    this.tagg = tags
