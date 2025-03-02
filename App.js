class App{

    colors = [
        [ '#66A319', { pr: 1, top: 1 } ],
        [ '#1676ca', { pr: 3, top: 2 } ],
        [ '#965CC0', { pr: 5, top: 3 } ],
        [ '#c2b3b3', { pr: 6, top: 4 } ],
        [ '#aab1bd', { pr: 7, top: 5 } ],
        [ '#f7b500', { pr: 4, top: 6 } ],
        [ '#CC5B5A', { pr: 2, top: 7 } ],
    ];
    
    constructor( data ){
        //this.data = data;
    }

    /*set_proxy( key ){
        this.data[ key ] = this.proxy( this.data[ key ], ( prop, value ) => {
            this.change_action( prop, value );
        });
    }*/

    set_proxy( key ){
        if( Array.isArray( this.data[ key ] ) ){
            this.data[ key ] = this.data[ key ].map( ( item, index ) =>
                this.proxy( item, ( prop, value ) => {
                    this.change_action( item, value );
                })
            );
        } 
        else{
            this.data[ key ] = this.proxy( this.data[ key ], ( prop, value ) => {
                this.change_action( prop, value );
            });
        }
    }

    proxy( data, callback ){

        return new Proxy( data, {
            set: ( target, prop, value, receiver ) => {
                const oldValue = target[ prop ];
                const result = Reflect.set( target, prop, value, receiver );
                if( oldValue !== value /*&& oldValue !== undefined*/ ) callback( prop, value );
                return result;
            },
            get: ( target, prop, receiver ) => {
                const value = Reflect.get( target, prop, receiver );
                return value;
            }

        });
    
    }

    make_request( url, data, callback ){

        var options = { }; 
        options.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        options.method = !data ? 'GET' : 'POST';
        if( !!data ) options.body = JSON.stringify( data );     

        fetch( url, options ).then( function( response ){

            callback( response );
        
        }); 
    }

    callAjax( url, body = null ) {

        return new Promise( ( resolve, reject ) => {
            if( !url ){
                console.warn( 'URL is required for AJAX call.' );
                reject( 'URL is required' );
                return;
            }

            const xmlhttp = new XMLHttpRequest( );

            xmlhttp.onreadystatechange = function( ){
                if( xmlhttp.readyState === 4 ){
                    if( xmlhttp.status === 200 ){
                        resolve( xmlhttp.responseText );
                    }
                    else{
                        console.error( 'AJAX request failed with status:', xmlhttp.status );
                        reject( 'AJAX request failed' );
                    }
                }
            };

            try{
                if( body ){
                    xmlhttp.open( 'POST', url, true );
                    xmlhttp.setRequestHeader( 'Content-Type', 'application/json' );
                    xmlhttp.send( JSON.stringify( body ) );
                }
                else{
                    xmlhttp.open( 'GET', url, true );
                    xmlhttp.send( );
                }
            }
            catch( e ){
                console.error( 'Error during AJAX request:', e );
                reject( e );
            }
        
        });
    
    }

    push_to_server( data ){
        
        return new Promise( ( resolve, reject ) => {
            
            fetch( '/push.php', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify( data )
            })
            .then( res => res.json( ) )
            .then( _res => {
                resolve( _res );
            })
            .catch( err => {
                reject( err );
            });
    
        });
    
    }

    async get_data( todo, itemCallback = null, callback = null ){

        if( !todo || !Array.isArray( todo ) || todo.length === 0 ){
            console.error( "Invalid 'todo' array provided." );
            if( callback ) callback( this.data.requests );
            return;
        }

        var requests = [ ];

        for( const el of todo ){

            if( el.complete ){
                //console.log( el );
                continue;
            }
            
            if( !el.method || !el.path ){
                console.error( "Invalid 'el' object structure:", el );
                if( callback ) callback( this.data.requests );
                return;
            }

            try{

                let request = { };
                var { path, body } = this.prepareRequest( el );

                if( path !== null ){
                    
                    const response = await this.callAjax( path, body );
                    
                    try{
                        request = JSON.parse( response );
                    } 
                    catch( e ){
                        console.error( "Failed to parse response JSON:", e );
                    }

                }

                if( request ){
                    //if( 'customFactors' in request ) delete request.customFactors;
                    //console.log( this.prepareUniq( el ) );
                    requests.push({ data: request, el: this.prepareUniq( el ) });
                }

                //console.log( this.prepareUniq( el, request ) );

                if( itemCallback ) itemCallback( request, this.prepareUniq( el ) );

            }
            catch( error ){
                //console.error( "Error in request for method " + el.method, error );
            }
        }

        if( callback ) callback( this.data.requests );

        if( Array.isArray( requests ) && requests.length > 0 ){

            this.push_to_server({ requests: requests, action: this.data.action })
                .then( ( serverResponse ) => {
                    console.log( "Server response:", serverResponse );
                });
        }
    
    }

    find_by( object, key, value ){
        for( const [ i, item ] of Object.entries( object ) ){
            if( item[ key ] == value ){
                return item;
                break;
            }
        }
    }

    findBy( collection, key, value ){
        return collection.find( ( item ) => item[ key ] === value );
    }

    check_parameters( uri, key, value ){
        var out = uri.match( /(.*)\?(.*)/ );
        if( out && out[ 2 ] ){
            var params = Object.fromEntries( out[ 2 ].split( '&' ).map( function( part ){ return part.split( '=' ); }) );
            if( params[ key ] !== 'undefined' ) params[ key ] = value;
            return out[ 1 ] + '?' + ( new URLSearchParams( params ).toString( ) );
        }
        return uri;
    }

    requests_parameters( list, key, value ){
        let that = this;
        for( const [ i, item ] of Object.entries( list ) ){
            list[ i ].path = that.check_parameters( item.path, key, value );
        }
    }

    convertTypes( value, type ){

        if( !type ) return value;
     
        switch( type ){
            case 'int':
                value = parseInt( value, 10 );
                break;
            case 'float':
                value = parseFloat( value );
                break;
            case 'bool':
                value = value === 'true' || value === true;
                break;
            case 'string':
                value = String( value );
                break;
        } 

        return value;
    }

    replacePlaceholders( value, source ){

        const getNestedValue = ( obj, path ) => 
            path.split( '.' ).reduce( ( acc, key ) => ( acc && acc[ key ] !== undefined ? acc[ key ] : null ), obj );

        if( typeof value === 'string' ){
            return value.replace( /\{([\w.]+)\}/g, ( match, p1 ) => getNestedValue( this.data[ source ], p1 ) ?? match );
        } 
        if( Array.isArray( value ) ){
            return value.map( item => this.replacePlaceholders( item, source ) );
        }
        if( typeof value === 'object' && value !== null ){
            return Object.fromEntries(
                Object.entries( value ).map( ( [ key, val ] ) => [ key, this.replacePlaceholders( val, source ) ] )
            );
        }
        return value;
    }

    prepareRequest( el ){

        const hasUnresolvedPlaceholders = ( obj ) => {
            if( typeof obj === 'string' ) return /\{([\w.]+)\}/.test( obj );
            if( Array.isArray( obj ) ) return obj.some( item => hasUnresolvedPlaceholders( item ) );
            if( typeof obj === 'object' && obj !== null ){
                return Object.values( obj ).some( value => hasUnresolvedPlaceholders ( value ) );
            }
            return false;
        };

        let path = el.path.replace( /\{([\w.]+)\}/g, ( match, key ) => 
            this.replacePlaceholders( `{${key}}`, el.source )
        );

        //path = path.includes( '{' ) ? null : path;

        if( path.includes( '{ ' ) ) return null;

        let body = null;
        if( typeof el.body === 'object' && el.body !== null ){
            body = Object.fromEntries(
                Object.entries( el.body ).map( ( [ key, val ] ) => [
                    key,
                    this.convertTypes( this.replacePlaceholders( val, el.source ), el.body_types?.[ key ] ?? null )
                ] )
            );
        }

        if( hasUnresolvedPlaceholders( body ) ) return null;

        return { path, body };
    
    }

    prepareUniq( el ){
        
        const getNestedValue = ( obj, path ) => 
            path.split( '.' ).reduce( ( acc, key ) => ( acc && acc[ key ] !== undefined ? acc[ key ] : `${path}`), obj );
        const uniqItems = this.toArray( el.uniq );
        const resolvedItems = uniqItems.map( item => getNestedValue( this.data[ el.source ] ?? { }, item ) );

        return {
            ...el,
            uniq: resolvedItems.join( '_' )
        }
    
    }

    change_action( property, value ){ }

    prepareApi( el ){
        var items = [ ];
        if( this.hasNestedProperty( this, 'data.br.uniq' ) && this.data.br.uniq[ el.method ] !== undefined ){

            for( const item of this.toArray( this.data.br.uniq[ el.method ] ) ){
                items.push( this.data.br[ item ] );    
            }
            el.uniq = items.join( '_' );
        }
    }

    get_h2h_before( el ){ }

    get_stats_team_versus_before( el ){ }

    /*mod_date( unixtime ){
        var mod_date = new Date( unixtime * 1000 ).toLocaleString( 'en-US', { month: "short", day: "numeric" });
        var today = new Date( );
        var match_date = new Date( unixtime * 1000 );
        if( match_date.toDateString( ) == today.toDateString( ) ) 
            mod_date = 'Today';
        if( match_date.toDateString( ) == new Date( today.setDate( today.getDate( ) + 1 ) ).toDateString( ) ) 
            mod_date = 'Tomorrow';
        return mod_date + ' at ' + new Date( unixtime * 1000 ).toLocaleString( 'en-US', { hour: "2-digit", minute: "2-digit" });
    }*/

    get_point( api_url ){
        var i = new URL( api_url );
        i = i.pathname.replace( /.*\/(\w+)$/is, '$1' );
        return i;
    }

    deepMerge( target, ...sources ){
        let that = this;
        if( !sources.length ) return target;
        sources.forEach( source => {
            if( that.isObject( target ) && that.isObject( source ) ){
                for( const key in source ){
                    if( that.isObject( source[ key ] ) ){
                        if( key === '__proto__' || key === 'constructor' || key === 'prototype' ){
                            continue; // Skip potentially dangerous keys to prevent prototype pollution.
                        }

                        if( !target[ key ] || !that.isObject( target[ key ] ) ){
                            target[ key ] = { }
                        }

                        that.deepMerge( target[ key ], source[ key ] );
                    } 
                    else target[ key ] = source[ key ];
                }
            }
        });
        return target
    }

    isObject( item ){
        return ( item && typeof item === 'object' && !Array.isArray( item ) && !( item instanceof Date ) );
    }

    getKeyPaths( obj, key, val = true, currentPath = '', result = [ ] ){
        let that = this;
        if( typeof obj !== 'object' || obj === null ) return result;
        for( const property in obj ){
            if( obj.hasOwnProperty( property ) ){
                const newPath = currentPath === '' ? property : `${currentPath}=>${property}`;
                if( Array.isArray( obj[ property ] ) ){
                    obj[ property ].forEach( ( item, index ) => {
                        that.getKeyPaths( item, key, val, `${newPath}[${index}]`, result );
                    });
                } 
                else that.getKeyPaths( obj[ property ], key, val, newPath, result );
        
                if( property === key && ( obj[ property ] == val || val == '_empty' ) ) result.push( newPath );
            }
        }

        return result;
    } 

    createObj( path, value, root ){
        var segments = path.split( '=>' ), cursor = root || window, segment, i;
        for( i = 0; i < segments.length - 1; ++i ){
            segment = segments[ i ];
            cursor = cursor[ segment ] = cursor[ segment ] || { };
        }
        return cursor[ segments[ i ] ] = value;
    }

    toArray( value ){
        return Array.isArray( value ) 
            ? value 
            : value != null 
                ? [ value ] 
                : [ ];
    }

    hasNestedProperty( obj, path ){
        return path.split( '.' ).reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : undefined, obj) !== undefined;
    }

    filterByTeams( array, id ){
        return array.filter( item => item.teams?.[ id ] );
    }

    getColor( offset, rank, countColors, countRanks ){
        const top = rank / countRanks < 0.7;
        const filteredColors = this.colors.filter( item => {
            const { pr, top: topValue } = item[ 1 ];
            return top ? topValue <= countColors : pr <= countColors;
        });
        return filteredColors[ offset ]?.[ 0 ];
    }

    sort( array, byKey, asc = true ){
        
        return array.sort( ( i, i2 ) => {
        
            const a = i[ byKey ] ?? null;
            const b = i2[ byKey ] ?? null;
            if( a === b ) return 0;
            if( asc ) return a < b ? -1 : 1; // Сортировка по возрастанию
            else return a > b ? -1 : 1; // Сортировка по убыванию
        
        });
    }



    
    static base62encode(number) {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const base = chars.length;
        let result = '';

        while (BigInt(number) > 0n) {
            const remainder = BigInt(number) % BigInt(base);
            result = chars[Number(remainder)] + result;
            number = BigInt(number) / BigInt(base);
        }

        return result || '0';
    }

    static base62decode(string) {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const base = chars.length;
        let number = 0n;

        for (let i = 0; i < string.length; i++) {
            const index = chars.indexOf(string[i]);
            number = BigInt(number) * BigInt(base) + BigInt(index);
        }

        return number.toString();
    }

    static encode(id, unix = 0, countryId = 0) {
        const idShifted = BigInt(id) * (1n << 40n); // 40 бит под ID
        const unixShifted = BigInt(unix) * (1n << 8n); // 32 бита под Unix-время
        const combined = idShifted + unixShifted + BigInt(countryId); // Финальное число

        return this.base62encode(combined); // Кодируем в base62
    }

    static decode(encoded) {
        let decoded = BigInt(this.base62decode(encoded));

        const extractedCountry = Number(decoded % (1n << 8n)); // Последние 8 бит — ID страны
        decoded = decoded / (1n << 8n); // Убираем страну
        const extractedUnix = Number(decoded % (1n << 32n)); // Следующие 32 бита — Unix-время
        const extractedId = Number(decoded / (1n << 32n)); // Остальные 40 бит — ID

        return {
            id: extractedId,
            unix: extractedUnix,
            countryId: extractedCountry
        };
    }


    parseUrl( url ){

        const path = url.split( /[?#]/ )[ 0 ];
        const parts = path.split( '/' ).filter( p => p !== '' );
        const result = { };

        const keywords = [ 'sports', 'live', 'event' ];
        const keyIndex = parts.findIndex( p => keywords.includes( p ) );
        if( keyIndex === -1 ) return result;

        const key = parts[ keyIndex ];
        const nextIndex = keyIndex + 1;

        if( key === 'sports' || key === 'live' ){
            if( parts.length > nextIndex ){
                result.kindsport = parts[ nextIndex ];
                if( parts.length > nextIndex + 1 ){
                    result.competition = parts[ nextIndex + 1 ];
                }
            }
        }
        else if( key === 'event' ){
            if( parts.length > nextIndex ){
                const nextPart = parts[ nextIndex ];
                result.event = nextPart;
            }
        }

        return result;

    }






    
}