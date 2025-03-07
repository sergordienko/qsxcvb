class HTMLGenerator {
   
   constructor(data) {
        this.data = data;
    }

    createHtmlContent( ) {
        return `
            <div class="ui vertical accordion sections scroll-box m-0" id="sports">
                ${Object.entries(this.data.live_events)
                    .map(([kindsport, sportinfo]) => this.shouldRenderSport(sportinfo) ? this.generateSportBlock(kindsport, sportinfo) : '')
                    .join('')}
            </div>
        `;
    }

    createHtmlMenu( ){
        return `
            <div class="dynamic-section overflow-hidden flex-grow d-flex flex-column">
                ${this.createTopItems()}
                ${this.createAccordionMenu()}
            </div>
        `;
    }

    createTopItems() {
        if( !this.data.topBlock ) return '';
        return `
            <div class="top-items border-bottom mb-2 pb-2" id="topBlock">
                ${Object.entries(this.data.topBlock)
                    .map(([index, item]) => this.createTopItem(index, item))
                    .join('')}
            </div>
        `;
    }

    createTopItem(index, item) {
        return `
            <div class="hover-blue${item.selected ? ' selected' : ''}">
                <a href="/${this.data.root}${item.link}" class="text-decoration-none nav-link2 p-3" data-type="${index}">
                    <div class="fs-7 py-2-ps-4 d-flex align-items-center justify-content-between">
                        <span class="d-flex align-items-center">
                            <img src="${item.image}" width="18" height="18">
                            <span class="ms-2">${item.name}</span>
                        </span>
                        ${item.info ? `<span class="text-muted fs-75 fw-500">${this[item.info](...item.args)}</span>` : ''}
                    </div>
                </a>
            </div>
        `;
    }

    createAccordionMenu() {
        if( !this.data.live_events ) return '';
        return `
            <div class="ui vertical accordion menu scroll-box">
                ${Object.entries(this.data.live_events)
                    .map(([kindsport, sportinfo]) => sportinfo.count && this[sportinfo.count](sportinfo.competitions, this.data.top, this.data.live, false) ? this.createAccordionItem(kindsport, sportinfo) : '')
                    .join('')}
            </div>
        `;
    }

    createAccordionItem(kindsport, sportinfo) {
        return `
            <div class="item" data-section="${kindsport}">
                ${this.createAccordionTitle(kindsport, sportinfo)}
                ${this.createAccordionContent(sportinfo)}
            </div>
        `;
    }

    createAccordionTitle(kindsport, sportinfo) {
        return `
            <div class="title d-flex align-items-center justify-content-between hover-blue${sportinfo.expand_menu ? ' active' : ''}${sportinfo.selected ? ' selected' : ''}" style="position: sticky; top: 0px; z-index: 25;">
                <a href="/${this.data.root}/${kindsport}" data-type="kindsport" class="text-decoration-none nav-link2 p-3">
                    <div class="fs-7 py-2-ps-4 d-flex align-items-center">
                        <img src="${sportinfo.logo}" width="18" height="18" class="" alt="${sportinfo.name}">
                        <span class="ms-2">${sportinfo.name}</span>
                    </div>
                </a>
                <i class="dropdown icon hover-b25"></i>
            </div>
        `;
    }

    createAccordionContent(sportinfo) {
        return `
            <div class="content${sportinfo.expand_menu ? ' active' : ''}">
                ${Object.keys(sportinfo.competitions).length ? this.createCompetitions(sportinfo) : ''}
            </div>
        `;
    }

    createCompetitions(sportinfo) {
        return `
            <div class="child-content" style="z-index: 20;">
                ${this.createTournamentsSearch(sportinfo)}
                ${Object.entries(sportinfo.competitions)
                    .map(([competition, competitioninfo]) => competitioninfo.count && this[competitioninfo.count](competitioninfo.events, this.data.top, this.data.live, false ) ? this.createCompetitionItem(sportinfo, competitioninfo) : '')
                    .join('')}
            </div>
        `;
    }

    createTournamentsSearch(sportinfo) {
        return `
            <div class="tournaments-search p-3">
                <div class="tournaments-search-input">
                    <input class="prompt" type="text" placeholder="Search..." value="${sportinfo.search ?? ''}">
                </div>
            </div>
        `;
    }

    createCompetitionItem(sportinfo, competitioninfo) {
        const isHide = sportinfo.search && competitioninfo.name.toLowerCase().indexOf(sportinfo.search.toLowerCase()) === -1;
        return `
            <div class="d-flex align-items-center justify-content-between competitions p-3 gap-3 hover-blue${competitioninfo.selected ? ' selected' : ''}${isHide ? ' d-none' : ''}" data-competition="${competitioninfo.bid}">
                ${this.createFavouritesIcon(competitioninfo)}
                <a href="/${this.data.root}/${sportinfo.name}/${App.encode(competitioninfo.tId || competitioninfo.id, 0, 0)}" data-type="competition" class="text-decoration-none nav-link2">
                    <div class="fs-7 d-flex align-items-center gap-2">
                        <img src="${competitioninfo.logo}" style="width: 16px;" />
                        <span class="text-truncate cursor-pointer" style="max-width: 80%;">${competitioninfo.name}</span>
                    </div>
                </a>
            </div>
        `;
    }

    createFavouritesIcon( item ){
        if( !this.data?.topBlock?.favourites ) return '';
        return `
            <span class="d-flex align-items-center cursor-pointer" resource-name="favorites">
                ${this.generateEventFavourite( item )}
            </span>
        `;
    }

    shouldRenderSport(sportinfo) {
        return sportinfo !== undefined &&
            sportinfo.show &&
            sportinfo.count &&
            this[sportinfo.count](sportinfo.competitions, this.data.top, this.data.live, this.data.favourites);
    }

    generateSportBlock(kindsport, sportinfo) {
        return `
            <div class="sport-section mb-3 item" data-kindsport="${kindsport}">
                ${this.generateSportHeader(sportinfo)}
                ${this.generateSportContent(sportinfo)}
            </div>
        `;
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

    generateSportContent( sportinfo ) {
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

    shouldRenderCompetition(competitioninfo) {
        return competitioninfo.show &&
            competitioninfo.count &&
            this[competitioninfo.count](competitioninfo.events, this.data.top, this.data.live, this.data.favourites);
    }

    generateCompetitionBlock(kindsport, competition, competitioninfo) {
        return `
            <div class="sportline-events-list">
                ${this.generateCompetitionHeader(kindsport, competition, competitioninfo)}
                ${this.generateCompetitionEvents(competitioninfo.events)}
            </div>
        `;
    }

    generateCompetitionHeader(kindsport, competition, competitioninfo) {
        return `
            <div class="sport-event-list-league-headline title active p-3 justify-content-between sticky-league">
                <div class="sport-event-list-league-headline-label gap-2" style="top: 38px; z-index: 25; position: sticky;">
                    <span class="d-flex align-items-center" style="color: #ccc;" resource-name="favorites">
                        <img src="${competitioninfo.favourite ? '/images/favorite-se.svg' : '/images/favorite.svg'}" style="width: 16px; height: 16px;">
                    </span>
                    <img src="${competitioninfo.logo}" style="width: 16px;">
                    <a href="/${this.data.root}/${kindsport}/${App.encode(competitioninfo.tId || competitioninfo.id, 0, 0)}" class="text-truncate text-dark text-decoration-none" style="max-width: 80%;">${competitioninfo.name}</a>
                </div>
                <i class="icon expand" style="opacity: .25;"></i>
            </div>
        `;
    }

    generateCompetitionEvents(events) {
        return Object.entries(events)
            .map(([index, event]) => this.shouldRenderEvent(event) ? this.generateEventBlock(event) : '')
            .join('');
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
                        <img src="${event.favourite ? '/images/favorite-se.svg' : '/images/favorite.svg'}" style="width: 16px; height: 16px;">
                    </span>
                    ${this.generateEventLink(event)}
                </div>
                ${this.generateEventTime(event)}
            </div>
        `;
    }

    generateEventLink(event) {
        return event.team2 ?
            `<a href="/event/${App.encode(event.id, event.startTime, event?.country?.id ?? 0)}" class="sportline-event-competitor-name">${event.team1} vs ${event.team2}</a>` :
            `<a href="/event/${App.encode(event.id, event.startTime, event?.country?.id ?? 0)}" class="sportline-event-competitor-name">${event.team1}</a>`;
    }

    generateEventTime(event) {
        return `
            <div class="d-flex gap-2">
                <span class="fs-8 d-flex align-items-center text-muted">
                    ${event.eventinfo?.timer ? `<i class="icon time me-1"></i><span>${event.eventinfo.timer}</span>` : `<span>${this.mod_date(event.startTime)}</span>`}
                </span>
                ${this.generateEventScores(event)}
            </div>
        `;
    }

    generateEventScores(event) {
        return event.eventinfo?.scores?.length ?
            `<span class="fw-500 fs-75">
                ${event.eventinfo.scores[0].map(score => `
                    <span>${'c2' in score ? `${score.c1}-${score.c2}` : `${score.c1}`}</span>
                    ${event.eventinfo.scoreComment ? `<span class="scc ms-1">${event.eventinfo.scoreComment}</span>` : ''}
                `).join('')}
            </span>` : '';
    }

    generateEventDetails(event) {
        return event.eventinfo?.subscores?.length ?
            `<div class="subscores ms4 ps-4 pe-2 pt-2 pb-2">
                ${event.eventinfo.subscores.map(subscore => !this.exclude_subscores().includes(subscore.kindId) ? `
                    <div class="d-flex align-items-center justify-content-between">
                        <span>${subscore.kindName}</span>
                        <span class="score">${'c2' in subscore ? `${subscore.c1}-${subscore.c2}` : `${subscore.c1}`}</span>
                    </div>
                ` : '').join('')}
            </div>` : '';
    }

    generateEventFavourite( item ) {
        return `
            <img src="${item.favourite ? '/images/favorite-se.svg' : '/images/favorite.svg'}" style="width: 16px; height: 16px;" />
        `;
    }

    exclude_subscores() {
        return [
            // Soccer
            '13700201', '403700', '403500', '400800', '11000201', '401000', '101900', '10800201',
            // Hockey
            '91', '21600102', '411600'
        ];
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
            const isTop = event.applicability &&
                event.applicability.some(i => ['top', 'top-live', 'sport', 'sport-live'].includes(i)) &&
                ((event.place === 'live' && live) || !live);
            const isFav = event.favourite && ((event.place === 'live' && live) || !live);
            const out = this.out_of_date(event.startTime);
            if ((!top || isTop) && (!favourite || isFav) && !out) {
                count++;
            }
        }
        return count;
    }

    _count_kindsport(competitions, top = false, live = false, favourite = false) {
        let count = 0;
        for (const [i, competition] of Object.entries(competitions)) {
            count += this.count_events(competition.events, top, live, favourite);
        }
        return count;
    }

    _count_competition(events, top = false, live = false, favourite = false) {
        return this.count_events(events, top, live, favourite);
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
}

export default HTMLGenerator;
