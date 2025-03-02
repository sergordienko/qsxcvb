class App_Sports extends App{

    constructor( data ){
        super( );
        this.data = data;
        this.init( );
    }

    init( ){

        var parsePath = window.location.pathname.match( new RegExp( '\/' + this.data.root + '\/?([^\/]*)\/?([^\/]*)\/?', 'i' ) );

        for( const [i, ] of Object.entries( this.data.topBlock ) ) if( parsePath && parsePath.includes( i ) ){
            this.data[ i ] = true; delete parsePath[ parsePath.indexOf( i ) ];
        }

        this.data[ 'kindsport' ] = parsePath && parsePath[ 1 ] ? parsePath[ 1 ].replace( /_/g, ' ' ) : '';
        this.data[ 'competition' ] = parsePath && parsePath[ 2 ] ? parsePath[ 2 ].replace( /_/g, ' ' ) : '';

        this.data.live_events = this.data.live_events || { };

        if( this.data.stop !== false && this.data.todo_api_list.length ){
        
            /*var time = Math.round( +new Date( ) / 1000 );
        
            this.get_data( this.data.todo_api_list, ( request, el ) => {
                this.build_events( request, el.method == 'get_listBase' );
                console.log( 'time ' + el.method + ' - ' + ( Math.round(+new Date()/1000) - time ) );
            });*/

            this.todo( );
        
        }
        else {
            this.live_update( );
        }

        this.liveUpdater = new LiveScoreUpdater( document.getElementById( "sports" ), this.data );

    }

    async todo( ){

        var time = Math.round( +new Date( ) / 1000 );

        for( const [ ,group ] of Object.entries( this.data.todo_api_list ) ){

            if( !group.complete ){

                var result = group.methods;

                await this.get_data( Object.values( result ), 
                    ( request, el ) => {

                        this.build_events( request, el.method == 'get_listBase' );
                        console.log( 'time ' + el.method + ' - ' + ( Math.round(+new Date()/1000) - time ) );

                    },
                    ( requests ) => {

                        group.complete = true;

                    });
            
            }
        
        }

    
    }

    watch_events( packet ){

        if( !packet ) return;
        var api_url = 'https://line53w.bk6bba-resources.com/events/list?lang=en&version=' + packet + '&scopeMarket=1600';
        this.make_request( api_url, null, ( response ) => {
            response.json( ).then( function( request ){
                if( 'customFactors' in request ) delete request.customFactors;
                this.build_events( request, true, 'live' );
            });
        });
    }

    find_sport_logo( object, sport ){
        
        let data = this.data;
        if( sport.tournamentInfoId && object.tournamentInfos && typeof object.tournamentInfos === 'object' ){
            for( const item of Object.values( object.tournamentInfos ) ){
                if( sport.tournamentInfoId == item.id ){
                    if( item.icon ) return this.data.cdn_resource + item.icon;
                    break;
                }
            }
        }

        if( this.data.logos && this.data.logos.competitions && this.data.logos.competitionLogos ){
            let logoId = this.data.logos.competitions[ sport.id ] || null;

            if( logoId && this.data.logos.competitionLogos[ logoId ] ){
                let logoObj = this.data.logos.competitionLogos[ logoId ];

                if( logoObj.object && logoObj.object.logoVector ){
                    return this.data.cdn_resource + logoObj.object.logoVector;
                }
            }
        }

        if( sport.regionId && data.flags && typeof data.flags === 'object' ){
            for( const flag of Object.values( data.flags ) ){
                if( flag.object && flag.object.alias == sport.regionId ){
                    return this.data.cdn_resource + flag.object.logoVector;
                }
            }
        }

        return this.data.default_img;
    }


    find_kindsport_logo( sport_id ){
        
        let data = this.data;

        if( !data.logos || !data.logos.sportKinds || !data.logos.sportKindLogos ){
            return data.default_img;
        }

        let logoId = data.logos.sportKinds[ sport_id ] || null;
        if( !logoId || !data.logos.sportKindLogos[ logoId ] ){
            return data.default_img;
        }

        let logoObject = data.logos.sportKindLogos[ logoId ].object || null;

        if( !logoObject ){
            return data.default_img;
        }

        if( logoObject.name ){
            // find custom logo
        }

        let typeLogo = 'logoBlackOutline';
        return logoObject[ typeLogo ] ? data.cdn_resource + logoObject[ typeLogo ] : data.default_img;
    }


    isSetState( object, property = 'show', state = false ){
        return Object.entries( object ).filter( obj => { return obj[ 1 ][ property ] === state; }).length ? true : false;  
    }

    getState( object, property = 'show', state = true, isset = false ){

        if( this.isSetState( object, property, isset ) ){
            var t = Object.entries( object ).filter( obj => { return obj[ 1 ][ property ] === state; });
            if( t[ 0 ] && t[ 0 ][ 0 ] ) return t[ 0 ][ 0 ];
        }
        return false;
    }

    sports_behavior( ){
        let that = this; let data = this.data;
        if( data.competition && data.kindsport ){
            that.setActive( data.kindsport, data.live_events, 'show', true, false );
            that.setActive( data.kindsport, data.live_events, 'selected', false, false );
            for( const property in data.live_events ){
                that.setActive( data.competition, data.live_events[ property ][ 'competitions' ], 'show', true, false );
                that.setActive( data.competition, data.live_events[ property ][ 'competitions' ], 'selected', true, false );
            }
        }
        else if( data.kindsport ){
            that.setActive( data.kindsport, data.live_events, 'show', true, false );
            that.setActive( data.kindsport, data.live_events, 'selected', true, false );
            for( const property in data.live_events ){
                that.setActive( data.kindsport, data.live_events[ property ][ 'competitions' ], 'selected', false, false );
                if( data.kindsport == property ){
                    that.setActive( data.kindsport, data.live_events[ property ][ 'competitions' ], 'show', true, true );
                }
            }
        }
        else{
            that.setActive( null, data.live_events, 'show', true, true );
            that.setActive( null, data.live_events, 'selected', false, false );
            for( const property in data.live_events ){
                that.setActive( null, data.live_events[ property ][ 'competitions' ], 'selected', false, false );
                that.setActive( null, data.live_events[ property ][ 'competitions' ], 'show', true, true );
            }
        }
    }

    topBlock_behavior( ){
        var current = null; let that = this;
        for( const [i, item] of Object.entries( that.data.topBlock ) ) if( that.data[ i ] ) current = i;
        that.setActive( current, that.data.topBlock, 'selected', true, false );
    }

    live_menu( ){
        this.sports_behavior( ); 
        this.topBlock_behavior( );
    }

    syncWithStorage( key, prefix ){
        var data = { }; let that = this;
        for( const item of that.getKeyPaths( that.data.live_events, key, true ) ){
            that.createObj( item, true, data );
        }
        localStorage.setItem( prefix, JSON.stringify( data ) );
    }

    setProperty( find, object, property, key, set, toggle = false, callback = null ){
        for( const index in object ){
            if( object[ index ][ property ] == find ){
                var value = ( !toggle ? set : set != object[ index ][ key ] );
                object[ index ][ key ] = value;
                //if( callback ) callback( object[ index ], value );
                return [ index, value ];
                break;
            }
        }
        //if( callback ) callback( null, null );
        return false;
    }

    setActive( find, object, key, set, unset = 'self' ){
        for( const property in object ){
            object[ property ][ key ] = property == find ? set : ( unset == 'self' ? object[ property ][ key ] : unset );
        }
    }

    set_favourite( ){
        
        let data = this.data; let that = this;
        if( !data.favourite ) return;

        var k = data.favourite?.kindsport;
        var c = data.favourite?.competition;
        var e = data.favourite?.event;

        var favCom = data.live_events?.[ k ]?.[ 'competitions' ]?.[ c ];

        if( !favCom ) return;

        if( e && favCom.events?.[ e ] ) favCom.events[ e ].favourite = true != favCom.events[ e ].favourite;
        else{
            favCom.favourite = true != favCom.favourite;
            for( const i in favCom.events ) 
                favCom.events[ i ].favourite = favCom.favourite;
        }

        this.syncWithStorage( 'favourite', 'favourites' );
        this.data.favourite = '';

        /*for( const property in data.live_events ){
            var r = that.setProperty( data.favourite, data.live_events[ property ][ 'competitions' ], 'name', 'favourite', true, true );
            if( r ){
                for( const i in data.live_events[ property ][ 'competitions' ][ r[ 0 ] ][ 'events' ] ) 
                    data.live_events[ property ][ 'competitions' ][ r[ 0 ] ][ 'events' ][ i ].favourite = r[ 1 ];
                break;
            }
            else{
                for( const indexCompetition in data.live_events[ property ][ 'competitions' ] ){
                    var c = that.setProperty( data.favourite, data.live_events[ property ][ 'competitions' ][ indexCompetition ][ 'events' ], 'name', 'favourite', true, true );
                    if( c ) break;
                }
            }
        }
        this.syncWithStorage( 'favourite', 'favourites' );
        this.data.favourite = '';*/
    }

    live_update( ){

        if( !this.data.live_events || !Object.keys( this.data.live_events ).length ) return;

        this.deepMerge( this.data.live_events, JSON.parse( localStorage.getItem( 'favourites' ) ) );

        this.live_menu( ); 

        //this.set_favourite( );

        const g = new HTMLGenerator( this.data );
        const updates = [
            //{ selector: '.main-content .sections', content: g.create_html_content( ) },
            { selector: '.dynamic-section', content: g.create_html_menu( ) },
        ];
        this.update_content( updates ).then(( ) => {

           // if( this.virtualScrollInstance )
            //    this.virtualScrollInstance.destroy( );
            this.virtualScrollInstance = new VirtualScroll( document.getElementById( "sports" ), this.data );
            //this.virtualScrollInstance.init( );

            //this.pendingUpdate = false;
        }).catch(( ) => {
            //this.pendingUpdate = false;
        });

    }

    /*freq_update( ){

        if( !this.data.live_events || !Object.keys( this.data.live_events ).length ) return;

        this.deepMerge( this.data.live_events, JSON.parse( localStorage.getItem( 'favourites' ) ) );

        //this.live_menu( ); 

        this.set_favourite( );

        this.liveUpdater = new LiveScoreUpdater( document.getElementById( "sports" ), this.data );
        this.liveUpdater.updateLiveElements( );

    }*/

    update_content( updates ){
        return new Promise( ( resolve, reject ) => {
            try {
                updates.forEach( ( { selector, content } ) => {
                    const element = document.querySelector( selector );
                    if( element ){
                        morphdom( element, content, { childrenOnly: true } );
                    }
                });
                resolve( 'Update completed successfully' );
            } 
            catch( error ){
                reject( `Error in update: ${error.message}` );
            }
        });
    }

    mutation_object_live( list, exists_events = true, sort = false ){
        
        let that = this;
        var data = this.data;
        if( !list ) return;
        var live_events = { };
        var base = data.requests[ 1 ] ? data.requests[ 1 ].data : list;

        var showSport = that.getState( data.live_events );
        var stateSport = showSport ? false : true;
        
        var showCompetition;
        for( const [ i, item ] of Object.entries( data.live_events ) ){
            if( showCompetition = that.getState( item.competitions ) ) break;
        }
        var stateCompetition = showCompetition ? false : true;

        var selectedCompetition;
        for( const [ i, item ] of Object.entries( data.live_events ) ){
            if( selectedCompetition = that.getState( item.competitions, 'selected', true, true ) ) break;
        }
        
        var expand_menu = that.getState( data.live_events, 'expand_menu', true, true ) || false;
        var expand_sport = that.getState( data.live_events, 'expand_sport', false, false ) || true;
        var selected = that.getState( data.live_events, 'show', true, true );

        var setEvent = ( event, eventinfo = null, sort ) => {
            if( event ){
                if( event.level == 1 && event.kind == 1 && !event.noEventView ){
                    
                    var sport = that.find_by( base[ 'sports' ], 'id', event.sportId );
                    var kindsport = that.find_by( base[ 'sports' ], 'id', sport.parentId );
                    var country = that.find_by( that.data.geo, 'region', sport?.regionId || 0 );
                    
                    if( data.live_events[ kindsport.name ] === undefined ){
                        data.live_events[ kindsport.name ] = {
                            expand_menu: expand_menu == kindsport.name || false,
                            expand_sport: expand_sport == kindsport.name || true,
                            selected: selected == kindsport.name ? true : false,
                            alias: kindsport.alias,
                            name: kindsport.name,
                            show: showSport == kindsport.name ? true : stateSport,
                            logo: that.find_kindsport_logo( kindsport.id ),
                            competitions: { },
                            sortOrder: kindsport.sortOrder,
                            count: '_count_kindsport'
                        };
                    }

                    if( data.exclude_competition.length && data.exclude_competition.includes( sport.id ) ) return;

                    var sportKey = App.encode( sport.tournamentInfoId || sport.id, 0, 0 );

                    data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ] = Object.assign( 
                        {
                            show: showCompetition == sportKey ? true : stateCompetition,
                            selected: selectedCompetition == sportKey ? true : false,
                            id: sport.id,
                            bid: sportKey,
                            name: sport.name,
                            sortOrder: data.custom_sort[ sport.id ] ? data.custom_sort[ sport.id ] : sport.sortOrder,
                            logo: that.find_sport_logo( base || list, sport ),
                            events: { },
                            count: '_count_competition',
                            tId: sport.tournamentInfoId
                        },
                        data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ] || { }
                    );



                    //if( !this.out_of_date( event.startTime ) ) return;

                    var eventKey = App.encode( event.id, event.startTime, country?.id ?? 0 );
                    //console.log( eventKey );
                    //var eventKey = event.sortOrder;

                    data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ][ eventKey ] = event;
                    data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ][ eventKey ].name = event.team2 ? event.team1 + ` vs ` + event.team2 : event.team1;
                    data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ][ eventKey ].country = country;
                    data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ][ eventKey ].bid = eventKey;
                    //data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ][ eventKey ].sp = sport;
                    
                    if( !eventinfo ) eventinfo = that.find_by( base[ 'liveEventInfos' ], 'eventId', event.id );
                    if( eventinfo ){
                        data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ][ eventKey ][ 'eventinfo' ] = eventinfo;
                    }

                    if( sort ){
                        data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ] = Object.fromEntries(
                            Object.entries( data.live_events[ kindsport.name ][ 'competitions' ][ sportKey ][ 'events' ] ).sort( ([,a], [,b]) => ( a.sortOrder > b.sortOrder ) ? 1 : -1 )
                        );
                    }
                }
            }
        }

        if( data.live ){
            for( const [ i, eventinfo ] of Object.entries( list.liveEventInfos ) ){
                setEvent( that.find_by( base[ 'events' ], 'id', eventinfo.eventId ), eventinfo, true );
            }

        }
        else{
            for( const [ i, event ] of Object.entries( list.events ) ){
                setEvent( event, null, true );
            }
        }



        if( !exists_events ){
            for( const [ sportkey, sport ] of Object.entries( list.sports ) ){
                if( !sport.parentId ){
                    if( data.live_events[ sport.name ] === undefined ){
                        data.live_events[ sport.name ] = {
                            expand_menu: expand_menu == sport.name || false,
                            expand_sport: expand_sport == sport.name || true,
                            selected: false,
                            alias: sport.alias,
                            name: sport.name,
                            show: showSport == sport.name ? true : stateSport,
                            logo: that.find_kindsport_logo( sport.id ),
                            competitions: { },
                            sortOrder: sport.sortOrder,
                            count: '_count_kindsport'
                        };
                    }
                }
            }
        }

        if( sort ){
            //Sort competitions
            for( const [ sportkey, sport ] of Object.entries( data.live_events ) ){
                data.live_events[ sportkey ][ 'competitions' ] = Object.fromEntries(
                    Object.entries( sport.competitions ).sort( ([,a], [,b]) => ( a.sortOrder > b.sortOrder ) ? 1 : -1 )
                );
            }

            //Sort sports
            data.live_events = Object.fromEntries(
                Object.entries( data.live_events ).sort( ([,a], [,b]) => ( a.sortOrder > b.sortOrder ) ? 1 : -1 )
            );

        }



    }

    build_events( list, exists_events = true ){
        if( !list ) return;
        this.data.packet = list.packetVersion;
        this.mutation_object_live( list, exists_events, true );
        this.live_update( );
    }

    out_of_date( time ){
        if( this.data.root !== 'sports' || !this.data.period || this.data.period == 'all' ) return false;
        var now = new Date( );
        now.setHours( now.getHours( ) + parseInt( this.data.period ) );
        if( time > Math.round( now.getTime( ) / 1000 ) ) return true;
        return false;
    }


}