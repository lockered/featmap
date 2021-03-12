
import { Renderer } from 'marked';
import marked from 'marked';



class WikiRenderer extends Renderer 
{
    heading( text: string, level: number): string { 
        return `\n${'='.repeat( level )} ${text} ${'='.repeat( level )}\n` 
    }
    paragraph (text: string): string {
        return '\n' + String( text )+'\n'}
    link ( href: string, title: string , text: string ):string { 
        return `[${href} ${text}]\n`
    }
    code ( code: string, lang: string ): string 
    { return `
<source lang="${lang}">\n
${code}
</source>\n
        `
    }
    br ():string { return '\n'}
    list( body: string, ordered: boolean, start: number ): string { 
        let lines = body.split( /\n/g ).map( line => line.trim() );
        let indentation = ordered === true ? '#' : '*';
    
        let ret = lines.join("\n"+indentation);

        return ret;
    }
    
    listitem (text: string): string  {
        let ret = `\n${text}`;
        return ret;
    }
    codespan (code: string): string { 
        return `\`${code}\``;
    }
    image (href: string): string { 
        return `[[Datei:(${href})]]`
    }
    blockquote(quote: string): string {
        return `\n<blockquote>\n ${quote}\n</blockquote>\n`
    }
    html(html: string): string {
        return html
    }
    hr(): string {
        return `----`
    }
    checkbox(checked: boolean): string {
        if(checked) {
            return `{{korrekt}}`
        } else {
            return `{{nichtkorrekt}}`
        }
    }
    table(header: string, body: string): string {
        return `table not supported`
    }
    tablerow(content: string): string {
        return ``
    }
    tablecell(content: string, flags: {
        header: boolean;
        align: 'center' | 'left' | 'right' | null;
    }): string {
        return ``
    }
    strong(text: string): string {
        return `'''${text}'''</strong>'''`
    }
    em(text: string): string {
        return `''${text}''`
    }
    text(text: string): string {
        return text
    }
    del(text: string): string {
        return `<s>${text}</s>`
    }
}

class AdocRenderer extends Renderer 
{
    heading( text: string, level: number): string { 
        return `\n${'='.repeat( level )} ${text}\n` 
    }
    paragraph (text: string): string {
        return '\n' + String( text )+ '\n'
    }
    link ( href: string, title: string , text: string ):string { 
        return `${href}[${text}^]`
    }
    code ( code: string, lang: string ): string 
    { return `
        [source,${lang}]
        ----
        ${code}
        ----
        `
    }
    br ():string { return '\n'}
    list( body: string, ordered: boolean, start: number ): string { 
        let lines = body.split( /\n+/g ).map( line => ' '+line.trim() );
        let indentation = ordered === true ? '.' : '*';
    
        let ret = lines.join("\n"+indentation);

        return ret;
    }
    
    listitem (text: string): string  {
        let ret = `\n ${text}`;
        return ret;
    }
    codespan (code: string): string { 
        return `\`${code}\``;
    }
    image (href: string): string { 
        return `image:${href}\n`
    }
    blockquote(quote: string): string {
        return `----\n${quote}\n----\n`
    }
    html(html: string): string {
        return html
    }
    hr(): string {
        return `''''\n`
    }
    checkbox(checked: boolean): string {
        if(checked) {
            return `{{korrekt}}`
        } else {
            return `{{nichtkorrekt}}`
        }
    }
    table(header: string, body: string): string {
        return `table not supported`
    }
    tablerow(content: string): string {
        return ``
    }
    tablecell(content: string, flags: {
        header: boolean;
        align: 'center' | 'left' | 'right' | null;
    }): string {
        return ``
    }
    strong(text: string): string {
        return `<strong>${text}</strong>`
    }
    em(text: string): string {
        return `<em>${text}</em>`
    }
    text(text: string): string {
        return text
    }
    del(text: string): string {
        return text
    }
}


export function convertMarkDownStringToWiki (markDown: string): string {

    marked.setOptions({renderer: new WikiRenderer()})
    // marked.use({renderer: new WikiRenderer()})
    var ret = marked( markDown);

    if ( ret[ 0 ] === '\n' ) {
        ret = ret.substring( 1 );
    }

    return ret;
}

export function convertMarkDownStringToAdoc (markDown: string): string {

    marked.setOptions({renderer: new AdocRenderer()})
    // marked.use({renderer: new WikiRenderer()})
    var ret = marked( markDown);

    if ( ret[ 0 ] === '\n' ) {
        ret = ret.substring( 1 );
    }

    return ret;
}

