class HTMLGenerator{

    constructor( data ){
        this.data = data;
    }

    create_html_content( ){

        var string = `<div class="ui vertical accordion sections scroll-box">`;
        for( const [ kindsport, sportinfo ] of Object.entries( this.data.live_events ) ){
            if( sportinfo !== undefined && sportinfo.show && sportinfo.count && this[ sportinfo.count ]( sportinfo.competitions, this.data.top, this.data.live, this.data.favourites ) ){
                string += `<div class="sport-section mb-3 item">`;
                string += `<div class="title-sport d-flex align-items-center justify-content-between title p-3 bg-white sticky-top` + ( sportinfo.expand_sport ? ` active` : `` ) + `">`; 
                string += `<span class="d-flex gap-2">`;
                string += `<img src="` + sportinfo.logo + `" style="width: 14px;">`;
                string += `<a href="/sports/` + sportinfo.name.replace( /\s+/g, '_' ) + `" class="text-decoration-none text-dark">` + sportinfo.name + `</a>`;
                string += `</span>`;
                string += `<i class="icon dropdown"></i>`;
                string += `</div>`;
                string += `<div class="content` + ( sportinfo.expand_sport ? ` active` : `` ) + `">`;
                string += `<div class="sportline-events-list-container">`;
                for( const [ competition, competitioninfo ] of Object.entries( sportinfo.competitions ) ){
                    if( competitioninfo.show && competitioninfo.count && this[ competitioninfo.count ]( competitioninfo.events, this.data.top, this.data.live, this.data.favourites ) ){
                        string += `<div class="sportline-events-list">`;
                        string += `<div class="sport-event-list-league-headline title active p-3 justify-content-between sticky-league">`;
                        string += `<div class="sport-event-list-league-headline-label gap-2" style="top: 38px;z-index: 25;position: sticky;">`;
                        string += `<span class="d-flex align-items-center" style="color: #ccc;" resource-name="favorites">`;
                        string += `<img src="` + ( competitioninfo.favourite ? `/images/favorite-se.svg` : `/images/favorite.svg` ) + `" style="width: 16px; height: 16px;" />`;
                        string += `</span>`;
                        string += `<img src="` + competitioninfo.logo + `" style="width: 16px;" />`;
                        string += `<a href="/` + this.data.root + `/` + kindsport + `/` + App.encode( ( competitioninfo.tId || competitioninfo.id ), 0, 0 ) + `" class="text-truncate text-dark text-decoration-none" style="max-width: 80%;">` + competitioninfo.name + `</a>`;
                        string += `</div>`; 
                        string += `<i class="icon expand" style="opacity: .25;"></i>`;            
                        string += `</div>`;
                        for( const [ index, event ] of Object.entries( competitioninfo.events ) ){
                            if( event.name && ( !this.data.favourites || event.favourite ) && ( !this.data.top || event.applicability && event.applicability.some( i => [ 'top', 'top-live', 'sport', 'sport-live' ].includes( i ) ) ) ){
                                if( !this.out_of_date( event.startTime ) ){
                                    string += `<div class="sportline-event-block">`;
                                    string += `<div class="sportline-event-block-container p-3">`;
                                    string += `<div class="d-flex align-items-center gap-2 justify-content-between pe-2">`;      
                                    string += `<div class="d-flex gap-2">`;
                                    string += `<span class="d-flex align-items-center" style="color: #ccc;" resource-name="favorites">`;
                                    string += `<img src="` + ( event.favourite ? `/images/favorite-se.svg` : `/images/favorite.svg` ) + `" style="width: 16px; height: 16px;" />`;
                                    string += `</span>`;
                                    if( event.team2 )
                                        string += `<a href="/event/` + App.encode( event.id, event.startTime, event?.country?.id ?? 0 ) + `" class="sportline-event-competitor-name">` + event.team1 + ` vs ` + event.team2 + `</a>`;
                                    else
                                        string += `<a href="/event/` + App.encode( event.id, event.startTime, event?.country?.id ?? 0 ) + `" class="sportline-event-competitor-name">` + event.team1 + `</a>`;
                                    string += `</div>`;
                                    //if( event.eventinfo ){
                                        string += `<div class="d-flex gap-2">`;
                                        string += `<span class="fs-8 d-flex align-items-center text-muted">`;
                                        if( event.eventinfo && event.eventinfo.timer ){
                                            string += `<i class="icon time me-1"></i>`;
                                            string += `<span>` + event.eventinfo.timer + `</span>`;        
                                        }
                                        else{
                                            string += `<span>` + this.mod_date( event.startTime ) + `</span>`; 
                                        }
                                        string += `</span>`;
                                        if( event.eventinfo && event.eventinfo.scores && event.eventinfo.scores.length ){
                                            string += `<span class="fw-500 fs-75">`;
                                            for( const [ index, score ] of Object.entries( event.eventinfo.scores[ 0 ] ) ){
                                                if( 'c2' in score )
                                                    string += `<span>` + score.c1 + `-` + score.c2 + `</span>`;
                                                else      
                                                    string += `<span>` + score.c1 + `</span>`;
                                                
                                                if( event.eventinfo.scoreComment )
                                                    string += `<span class="scc ms-1">` + event.eventinfo.scoreComment + `</span>`;
                                            }
                                            string += `</span>`;
                                        }
                                        string += `</div>`;
                                    //}
                                    string += `</div>`;
                                    if( event.eventinfo ){
                                        if( event.eventinfo.subscores && event.eventinfo.subscores.length ){
                                            string += `<div class="subscores ms4 ps-4 pe-2 pt-2 pb-2" style="">`;
                                            for( const [ index, subscore ] of Object.entries( event.eventinfo.subscores ) ){
                                                if( subscore !== undefined && !this.exclude_subscores( ).includes( subscore.kindId ) ){
                                                    string += `<div class="d-flex align-items-center justify-content-between">`;
                                                    string += `<span>` + subscore.kindName + `</span>`;
                                                    string += `<span class="score">`;
                                                    if( 'c2' in subscore ) 
                                                        string += `<span>` + subscore.c1 + `-` + subscore.c2 + `</span>`;
                                                    else
                                                        string += `<span>` + subscore.c1 + `</span>`;
                                                    string += `</span>`;
                                                    string += `</div>`;
                                                }
                                            }
                                            string += `</div>`;
                                        }
                                    }
                                    string += `</div>`;
                                    string += `</div>`;
                                }
                                                    
                            }
                        }
                        string += `</div>`;
                    }
                }
                string += `</div>`;
                string += `</div>`;
                string += `</div>`;
            }
        }
        string += `</div>`;

        return string;
    }

    create_html_menu( ){

        var string = `<div class="dynamic-section overflow-hidden flex-grow d-flex flex-column">`;

        string += `<div class="top-items border-bottom mb-3 pb-3" id="topBlock">`;
        for( const [ index, item ] of Object.entries( this.data.topBlock ) ){
            string += `<div class="hover-blue` + ( item.selected ? ` selected` : `` ) + `">`;
            string += `<a href="/` + this.data.root + item.link + `" class="text-decoration-none nav-link2 p-3" data-type="` + index + `">`;
            string += `<div class="fs-7 py-2-ps-4 d-flex align-items-center justify-content-between">`;
            string += `<span class="d-flex align-items-center">`;
            string += `<img src="` + item.image + `" width="18" height="18">`;
            string += `<span class="ms-2">` + item.name + `</span>`;
            string += `</span>`;
            if( item.info ){
                string += `<span class="text-muted fs-75 fw-500">` + this[ item.info ]( ...item.args ) + `</span>`;
            }
            string += `</div>`;
            string += `</a>`;
            string += `</div>`;
        }
        string += '</div>';

        string += `<div class="ui vertical accordion menu scroll-box">`;
        for( const [ kindsport, sportinfo ] of Object.entries( this.data.live_events ) ){
            if( sportinfo.count /*sportinfo.count( sportinfo, _data.top, _data.live, _data.favourites )*/ ){
                string += `<div class="item" data-section="` + kindsport + `">`;
                string += `<div class="title d-flex align-items-center justify-content-between hover-blue` + ( sportinfo.expand_menu ? ` active` : `` ) + ( sportinfo.selected ? ` selected` : `` ) + `" style="position: sticky;top: 0px;z-index: 25;">`;
                string += `<a href="/` + this.data.root + `/` + kindsport + `" data-type="kindsport" class="text-decoration-none nav-link2 p-3">`;
                string += `<div class="fs-7 py-2-ps-4 d-flex align-items-center">`;
                string += `<img src="` + sportinfo.logo + `" width="18" height="18" class="" alt="` + sportinfo.name + `">`;
                string += `<span class="ms-2">` + sportinfo.name + `</span>`;
                string += `</div>`;
                string += `</a>`;
                string += `<i class="dropdown icon hover-b25"></i>`;
                string += `</div>`;
                string += `<div class="content` + ( sportinfo.expand_menu ? ` active` : `` ) + `">`;
                if( Object.keys( sportinfo.competitions ).length ){
                    string += `<div class="child-content" style="z-index: 20;">`;
                    string += `<div class="tournaments-search p-3">`;
                    string += `<div class="tournaments-search-input">`;
                    string += `<input class="prompt" type="text" placeholder="Search..." value="` + ( sportinfo.search ?? '' ) + `">`;
                    string += `</div>`;
                    string += `</div>`;
                    for( const [ competition, competitioninfo ] of Object.entries( sportinfo.competitions ) ){
                        if( competitioninfo.count && this[ competitioninfo.count ]( competitioninfo.events ) ){
                            var isHide = sportinfo.search && competitioninfo.name.toLowerCase( ).indexOf( sportinfo.search.toLowerCase( ) ) == -1;
                            string += `<div class="d-flex align-items-center justify-content-between competitions hover-blue` + ( competitioninfo.selected ? ` selected` : `` ) + ( isHide ? ` d-none` : `` ) + `">`;
                            string += `<span class="d-flex align-items-center p-3 cursor-pointer" resource-name="favorites">`;
                            string += `<img src="` + ( competitioninfo.favourite ? `/images/favorite-se.svg` : `/images/favorite.svg` ) + `" style="width: 16px; height: 16px;" />`;
                            string += `</span>`;
                            string += `<a href="/` + this.data.root + `/` + kindsport + `/` + App.encode( ( competitioninfo.tId || competitioninfo.id ), 0, 0 ) + `" data-type="competition" class="text-decoration-none nav-link2 pe-3 pb-3 pt-3">`;
                            string += `<div class="fs-7 d-flex align-items-center">`;
                            string += `<span class="text-truncate cursor-pointer" style="max-width: 80%;">` + competitioninfo.name + `</span>`;
                            string += `</div>`;
                            string += `</a>`;
                            string += `</div>`; 
                        }
                    }
                    string += `</div>`;
                }
                string += `</div>`;
                string += `</div>`;
            }
        }
        string += `</div>`;
        string += `</div>`;

        return string;     
    }

    out_of_date( time ){
        if( this.data.root !== 'sports' || !this.data.period || this.data.period == 'all' ) return false;
        var now = new Date( );
        now.setHours( now.getHours( ) + parseInt( this.data.period ) );
        if( time > Math.round( now.getTime( ) / 1000 ) ) return true;
        return false;
    }

    _count_kindsport( competitions, top = false, live = false, favourite = false ){
        var count = 0; let that = this;
        for( var [ i, competition ] of Object.entries( competitions ) ){
            count += that.count_events( competition.events, top, live, favourite );
        }
        return count;
    }

    _count_competition( events, top = false, live = false, favourite = false ){
        return this.count_events( events, top, live, favourite );
    }

    count_events ( events, top, live, favourite ){
        var count = 0; let that = this;
        if( !events ) return count;
        for( var [ , event ] of Object.entries( events ) ){
            if( !event.name ) continue; //?
            var isTop = ( 
                event.applicability && 
                event.applicability.some(i => [ 'top', 'top-live', 'sport', 'sport-live' ].includes( i ) ) && 
                ( ( event.place == 'live' && live ) || !live )
            );
            var isFav = ( 
                event.favourite &&
                ( ( event.place == 'live' && live ) || !live )
            );
            var out = that.out_of_date( event.startTime );
            if( ( !top || isTop ) && ( !favourite || isFav ) && !out ){
                count++;
            }
        }
        return count;
    }

    capitalizeFirstLetter( val ){
        return String( val ).charAt( 0 ).toUpperCase( ) + String( val ).slice( 1 );
    }

    exclude_subscores( ){
        return [
            //Soccer
            '13700201', '403700', '403500', '400800', '11000201', '401000', '101900', '10800201',
            //Hockey
            '91', '21600102', '411600'
        ];
    }

    mod_date( unixtime ){
        var mod_date = new Date( unixtime * 1000 ).toLocaleString( 'en-US', { month: "short", day: "numeric" });
        var today = new Date( );
        var match_date = new Date( unixtime * 1000 );
        if( match_date.toDateString( ) == today.toDateString( ) ) 
            mod_date = 'Today';
        if( match_date.toDateString( ) == new Date( today.setDate( today.getDate( ) + 1 ) ).toDateString( ) ) 
            mod_date = 'Tomorrow';
        return mod_date + ' at ' + new Date( unixtime * 1000 ).toLocaleString( 'en-US', { hour: "2-digit", minute: "2-digit" });
    }

    countEvents( kindsport = null, top = false, live = false, favourite = false ){
        let that = this;
        var count = 0;
        for( const [ index, sportinfo ] of Object.entries( that.data.live_events ) ){
            if( ( sportinfo.name == kindsport || !kindsport ) && sportinfo.count ){
                count = count + that[ sportinfo.count ]( sportinfo.competitions, top, live, favourite );
            }
        }
        return count;
    }

    totalCountEvents( kindsport = null, top = false, live = false, favourite = false ){
        return this.countEvents( kindsport, top, live, favourite );
    }

    topCountEvents( kindsport = null, top = false, live = false, favourite = false ){
        return this.countEvents( kindsport, top, live, favourite );
    }

    favouritesCountEvents( kindsport = null, top = false, live = false, favourite = false ){
        return this.countEvents( kindsport, top, live, favourite );
    }

}





class VirtualScroll {

    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.observer = null;
        this.animationFrameId = null;
        this.init();
    }

    init() {
        //this.deepMerge( this.data.live_events, JSON.parse( localStorage.getItem( 'favourites' ) ) );
        this.refresh();
        this.initIntersectionObserver();
    }

    refresh() {
        this.render();
    }

    render() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => {
            morphdom(this.container, this.generateHtmlContent(), { childrenOnly: true });
            this.animationFrameId = null;
            this.observeCompetitions();
        });
    }

    generateHtmlContent() {
        let html = `<div class="ui vertical accordion sections scroll-box m-0" id="sports">`;
        for (const [kindsport, sportinfo] of Object.entries(this.data.live_events)) {
            if (this.shouldRenderSport(sportinfo)) {
                html += this.generateSportBlock(kindsport, sportinfo);
            }
        }
        html += `</div>`;
        return html;
    }

    shouldRenderSport(sportinfo) {
        return sportinfo !== undefined &&
            sportinfo.show &&
            sportinfo.count &&
            this[sportinfo.count](sportinfo.competitions, this.data.top, this.data.live, this.data.favourites);
    }

    shouldRenderCompetition(competitioninfo) {
        return competitioninfo.show &&
            competitioninfo.count &&
            this[competitioninfo.count](competitioninfo.events, this.data.top, this.data.live, this.data.favourites);
    }

    generateSportBlock(kindsport, sportinfo) {
        let block = `<div class="sport-section mb-3 item" data-kindsport="${kindsport}">`;

        block += this.generateSportHeader(sportinfo);

        block += this.generateSportContent(sportinfo);

        block += `</div>`;

        return block;
    }

    generateSportHeader(sportinfo) {
        return `
            <div class="title-sport d-flex align-items-center justify-content-between title p-3 bg-white sticky-top${sportinfo.expand_sport ? ' active' : ''}">
                <span class="d-flex gap-2">
                    <img src="${sportinfo.logo}" style="width: 14px;">
                    <a href="/sports/${sportinfo.name.replace(/\s+/g, '_')}" class="text-decoration-none text-dark">${sportinfo.name}</a>
                </span>
                <i class="icon dropdown"></i>
            </div>
        `;
    }

    generateSportContent(sportinfo) {
        let content = `<div class="content${sportinfo.expand_sport ? ' active' : ''}">`;
        content += `<div class="sportline-events-list-container">`;

        for (const [competition, competitioninfo] of Object.entries(sportinfo.competitions)) {
            if (this.shouldRenderCompetition(competitioninfo)) {
                content += `<div class="competition" data-competition="${competition}"></div>`;
            }
        }

        content += `</div></div>`;
        return content;
    }

    generateCompetitionBlock(kindsport, competition, competitioninfo) {
        let block = `<div class="sportline-events-list">`;
        block += this.generateCompetitionHeader(kindsport, competition, competitioninfo);
        block += this.generateCompetitionEvents(competitioninfo.events);
        block += `</div>`;
        return block;
    }

    generateCompetitionHeader(kindsport, competition, competitioninfo) {
        return `
            <div class="sport-event-list-league-headline title active p-3 justify-content-between sticky-league">
                <div class="sport-event-list-league-headline-label gap-2" style="top: 38px;z-index: 25;position: sticky;">
                    <span class="d-flex align-items-center" style="color: #ccc;" resource-name="favorites">
                        <img src="${competitioninfo.favourite ? '/images/favorite-se.svg' : '/images/favorite.svg'}" style="width: 16px; height: 16px;" />
                    </span>
                    <img src="${competitioninfo.logo}" style="width: 16px;" />
                    <a href="/${this.data.root}/${kindsport}/${App.encode((competitioninfo.tId || competitioninfo.id), 0, 0)}" class="text-truncate text-dark text-decoration-none" style="max-width: 80%;">${competitioninfo.name}</a>
                </div>
                <i class="icon expand" style="opacity: .25;"></i>
            </div>
        `;
    }

    generateCompetitionEvents(events) {
        let eventsHtml = '';
        for (const [index, event] of Object.entries(events)) {
            if (this.shouldRenderEvent(event)) {
                eventsHtml += this.generateEventBlock(event);
            }
        }
        return eventsHtml;
    }

    shouldRenderEvent(event) {
        return event.name &&
            (!this.data.favourites || event.favourite) &&
            (!this.data.top || (event.applicability && event.applicability.some(i => ['top', 'top-live', 'sport', 'sport-live'].includes(i)))) &&
            !this.out_of_date(event.startTime);
    }

    generateEventBlock(event) {
        return `
            <div class="sportline-event-block" data-event-id="${event.bid}">
                <div class="sportline-event-block-container p-3">
                    ${this.generateEventHeader(event)}
                    ${this.generateEventDetails(event)}
                </div>
            </div>
        `;
    }

    generateEventHeader(event) {
        return `
            <div class="d-flex align-items-center gap-2 justify-content-between pe-2">
                <div class="d-flex gap-2">
                    <span class="d-flex align-items-center" style="color: #ccc;" resource-name="favorites">
                        <img src="${event.favourite ? '/images/favorite-se.svg' : '/images/favorite.svg'}" style="width: 16px; height: 16px;" />
                    </span>
                    ${this.generateEventLink(event)}
                </div>
                ${this.generateEventTime(event)}
            </div>
        `;
    }

    generateEventLink(event) {
        if (event.team2) {
            return `<a href="/event/${App.encode(event.id, event.startTime, event?.country?.id ?? 0)}" class="sportline-event-competitor-name">${event.team1} vs ${event.team2}</a>`;
        } else {
            return `<a href="/event/${App.encode(event.id, event.startTime, event?.country?.id ?? 0)}" class="sportline-event-competitor-name">${event.team1}</a>`;
        }
    }

    generateEventTime(event) {
        return `
            <div class="d-flex gap-2">
                <span class="fs-8 d-flex align-items-center text-muted">
                    ${event.eventinfo && event.eventinfo.timer ? `<i class="icon time me-1"></i><span>${event.eventinfo.timer}</span>` : `<span>${this.mod_date(event.startTime)}</span>`}
                </span>
                ${this.generateEventScores(event)}
            </div>
        `;
    }

    generateEventScores(event) {
        if (event.eventinfo && event.eventinfo.scores && event.eventinfo.scores.length) {
            return `
                <span class="fw-500 fs-75">
                    ${event.eventinfo.scores[0].map(score => `
                        <span>${'c2' in score ? `${score.c1}-${score.c2}` : `${score.c1}`}</span>
                        ${event.eventinfo.scoreComment ? `<span class="scc ms-1">${event.eventinfo.scoreComment}</span>` : ''}
                    `).join('')}
                </span>
            `;
        }
        return '';
    }

    generateEventDetails(event) {
        if (event.eventinfo && event.eventinfo.subscores && event.eventinfo.subscores.length) {
            return `
                <div class="subscores ms4 ps-4 pe-2 pt-2 pb-2">
                    ${event.eventinfo.subscores.map(subscore => `
                        ${!this.exclude_subscores().includes(subscore.kindId) ? `
                            <div class="d-flex align-items-center justify-content-between">
                                <span>${subscore.kindName}</span>
                                <span class="score">${'c2' in subscore ? `${subscore.c1}-${subscore.c2}` : `${subscore.c1}`}</span>
                            </div>
                        ` : ''}
                    `).join('')}
                </div>
            `;
        }
        return '';
    }

    observeCompetitions() {
        document.querySelectorAll('.competition').forEach(competition => {
            this.observer.observe(competition);
        });
    }

    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.2
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const competitionElement = entry.target;
                    const kindsport = competitionElement.closest('.sport-section').dataset.kindsport;
                    const competition = competitionElement.dataset.competition;
                    const sportinfo = this.data.live_events[kindsport];
                    const competitioninfo = sportinfo.competitions[competition];

                    competitionElement.innerHTML = this.generateCompetitionBlock(kindsport, competition, competitioninfo);
                    this.observer.unobserve(competitionElement);
                }
            });
        }, options);

        this.observeCompetitions();
    }

    // Вспомогательные методы

    _count_kindsport(competitions, top = false, live = false, favourite = false) {
        var count = 0; let that = this;
        for (var [i, competition] of Object.entries(competitions)) {
            count += that.count_events(competition.events, top, live, favourite);
        }
        return count;
    }

    _count_competition(events, top = false, live = false, favourite = false) {
        return this.count_events(events, top, live, favourite);
    }

    out_of_date(time) {
        if (this.data.root !== 'sports' || !this.data.period || this.data.period === 'all') return false;
        const now = new Date();
        now.setHours(now.getHours() + parseInt(this.data.period));
        return time > Math.round(now.getTime() / 1000);
    }

    count_events(events, top, live, favourite) {
        let count = 0;
        if (!events) return count;
        for (const [, event] of Object.entries(events)) {
            if (!event.name) continue;
            const isTop = event.applicability && event.applicability.some(i => ['top', 'top-live', 'sport', 'sport-live'].includes(i)) && ((event.place === 'live' && live) || !live);
            const isFav = event.favourite && ((event.place === 'live' && live) || !live);
            const out = this.out_of_date(event.startTime);
            if ((!top || isTop) && (!favourite || isFav) && !out) {
                count++;
            }
        }
        return count;
    }

    exclude_subscores() {
        return [
            // Soccer
            '13700201', '403700', '403500', '400800', '11000201', '401000', '101900', '10800201',
            // Hockey
            '91', '21600102', '411600'
        ];
    }

    mod_date(unixtime) {
        let mod_date = new Date(unixtime * 1000).toLocaleString('en-US', { month: "short", day: "numeric" });
        const today = new Date();
        const match_date = new Date(unixtime * 1000);
        if (match_date.toDateString() === today.toDateString())
            mod_date = 'Today';
        if (match_date.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString())
            mod_date = 'Tomorrow';
        return mod_date + ' at ' + new Date(unixtime * 1000).toLocaleString('en-US', { hour: "2-digit", minute: "2-digit" });
    }

    countEvents(kindsport = null, top = false, live = false, favourite = false) {
        let count = 0;
        for (const [index, sportinfo] of Object.entries(this.data.live_events)) {
            if ((sportinfo.name === kindsport || !kindsport) && sportinfo.count) {
                count += this[sportinfo.count](sportinfo.competitions, top, live, favourite);
            }
        }
        return count;
    }

    totalCountEvents(kindsport = null, top = false, live = false, favourite = false) {
        return this.countEvents(kindsport, top, live, favourite);
    }

    topCountEvents(kindsport = null, top = false, live = false, favourite = false) {
        return this.countEvents(kindsport, top, live, favourite);
    }

    favouritesCountEvents(kindsport = null, top = false, live = false, favourite = false) {
        return this.countEvents(kindsport, top, live, favourite);
    }

    deepMerge( target, ...sources ){
        if( !sources.length ) return target;
        sources.forEach( source => {
            if( this.isObject( target ) && this.isObject( source ) ){
                for( const key in source ){
                    if( this.isObject( source[ key ] ) ){
                        if( key === '__proto__' || key === 'constructor' || key === 'prototype' ){
                            continue; // Skip potentially dangerous keys to prevent prototype pollution.
                        }

                        if( !target[ key ] || !this.isObject( target[ key ] ) ){
                            target[ key ] = { }
                        }

                        this.deepMerge( target[ key ], source[ key ] );
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
}


class LiveScoreUpdater {

    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.init( );
    }

    init() {
        //this.updateLiveElements();
        this.initFavouriteClickHandler( );
    }

    updateLiveElements() {
        if (!this.data || !this.data.live_events) return;

        for (const [kindsport, sportinfo] of Object.entries(this.data.live_events)) {
            if (!sportinfo.competitions) continue;

            for (const [competition, competitioninfo] of Object.entries(sportinfo.competitions)) {
                if (!competitioninfo.events) continue;

                for (const [index, event] of Object.entries(competitioninfo.events)) {
                    this.updateEventElement(event);
                }
            }
        }

        // Schedule the next update
        requestAnimationFrame(this.updateLiveElements.bind(this));
    }

    updateEventElement(event) {
        const eventElement = document.querySelector(`.sportline-event-block[data-event-id="${event.bid}"]`);
        if (!eventElement) return;

        if (this.isEventEnded(event)) {
            eventElement.remove();
            return;
        }

        //this.updateEventScore(event, eventElement);
        //this.updateEventTimer(event, eventElement);
        //this.updateEventFavourite(event, eventElement);
        //this.updateEventSubscores(event, eventElement);
    }

    isEventEnded(event) {
        return event.eventinfo && event.eventinfo.scores && event.eventinfo.scores.some(score => score.status === 'end');
    }

    updateEventScore(event, eventElement) {
        const scoreElement = eventElement.querySelector('.score');
        if (!scoreElement) return;

        const newScore = this.generateEventScores(event);
        if (scoreElement.innerHTML !== newScore) {
            scoreElement.innerHTML = newScore;
        }
    }

    updateEventTimer(event, eventElement) {
        const timerElement = eventElement.querySelector('.timer');
        if (!timerElement) return;

        const newTimer = this.generateEventTimer(event);
        if (timerElement.innerHTML !== newTimer) {
            timerElement.innerHTML = newTimer;
        }
    }

    updateEventFavourite( item ) {


        const element = document.querySelector( `[data-event-id="${item.bid}"]` ) || document.querySelector( `[data-competition="${item.bid}"]` );
        const favouriteElement = element?.querySelector( '[resource-name="favorites"]' );

        if (!favouriteElement) return;

        const newFavourite = this.generateEventFavourite(item);
        if (favouriteElement.innerHTML !== newFavourite) {
            favouriteElement.innerHTML = newFavourite;
        }
    }

    updateEventSubscores(event, eventElement) {
        const subscoresElement = eventElement.querySelector('.subscores');
        if (!subscoresElement) return;

        const newSubscores = this.generateEventSubscores(event);
        if (subscoresElement.innerHTML !== newSubscores) {
            subscoresElement.innerHTML = newSubscores;
        }
    }

    generateEventScores(event) {
        if (event.eventinfo && event.eventinfo.scores && event.eventinfo.scores.length) {
            return event.eventinfo.scores[0].map(score => `
                <span>${'c2' in score ? `${score.c1}-${score.c2}` : `${score.c1}`}</span>
                ${event.eventinfo.scoreComment ? `<span class="scc ms-1">${event.eventinfo.scoreComment}</span>` : ''}
            `).join('');
        }
        return '';
    }

    generateEventTimer(event) {
        return event.eventinfo && event.eventinfo.timer ? `<i class="icon time me-1"></i><span>${event.eventinfo.timer}</span>` : '';
    }

    generateEventFavourite(event) {
        return `
            <img src="${event.favourite ? '/images/favorite-se.svg' : '/images/favorite.svg'}" style="width: 16px; height: 16px;" />
        `;
    }

    generateEventSubscores(event) {
        if (event.eventinfo && event.eventinfo.subscores && event.eventinfo.subscores.length) {
            return event.eventinfo.subscores.map(subscore => `
                ${!this.excludeSubscores().includes(subscore.kindId) ? `
                    <div class="d-flex align-items-center justify-content-between">
                        <span>${subscore.kindName}</span>
                        <span class="score">${'c2' in subscore ? `${subscore.c1}-${subscore.c2}` : `${subscore.c1}`}</span>
                    </div>
                ` : ''}
            `).join('');
        }
        return '';
    }

    excludeSubscores() {
        return [
            // Soccer
            '13700201', '403700', '403500', '400800', '11000201', '401000', '101900', '10800201',
            // Hockey
            '91', '21600102', '411600'
        ];
    }

    initFavouriteClickHandler( ) {

        this.container.addEventListener( 'click', ( event ) => {
            
            const target = event.target.closest( '[resource-name="favorites"]' );
            if( !target ) return;

            event.preventDefault( );

            var url = target.closest( 'div' ).querySelector( '[href]' ).getAttribute( 'href' );
            var parts = app.parseUrl( url );

            if( !parts?.kindsport ){
                var pK = app.parseUrl( target.closest( '.sport-section' ).querySelector( '.title-sport [href]' ).getAttribute( 'href' ) );
            }

            if( !parts?.competition ){
                var pC = app.parseUrl( target.closest( '.sportline-events-list' ).querySelector( '.sport-event-list-league-headline [href]' ).getAttribute( 'href' ) );
            }

            this.data[ 'favourite' ] = { ...parts, ...pK, ...pC };
            this.set_favourite( );

        });
    }

    set_favourite( ){
        
        let data = this.data; let that = this;
        if( !data.favourite ) return;

        var k = data.favourite?.kindsport;
        var c = data.favourite?.competition;
        var e = data.favourite?.event;

        var favCom = data.live_events?.[ k ]?.[ 'competitions' ]?.[ c ];

        if( !favCom ) return;

        if( e && favCom.events?.[ e ] ){
            favCom.events[ e ].favourite = true != favCom.events[ e ].favourite;
            this.updateEventFavourite( favCom.events[ e ] );
        }
        else{
            favCom.favourite = true != favCom.favourite;
            this.updateEventFavourite( favCom );
            for( const i in favCom.events ){
                favCom.events[ i ].favourite = favCom.favourite;
                this.updateEventFavourite( favCom.events[ i ] );
            }
        }

        this.syncWithStorage( 'favourite', 'favourites' );
        this.data.favourite = '';

        //VirtualScroll.deepMerge( this.data.live_events, JSON.parse( localStorage.getItem( 'favourites' ) ) );

    }

    syncWithStorage( key, prefix ){
        var data = { };
        for( const item of this.getKeyPaths( this.data.live_events, key, true ) ){
            this.createObj( item, true, data );
        }
        localStorage.setItem( prefix, JSON.stringify( data ) );
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

}