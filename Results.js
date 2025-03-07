class Results {

    constructor( selector, data ){

        this.selector = selector;
        this.container = document.querySelector( selector );
        this.data = data;
        this.filteredData = null;

        this.initAccordion( );
        this.initSearchEvent( );
        this.initClearSearch( );
        document.addEventListener( 'navigationUpdate', this.handleNavigationUpdate );
        //this.init( );
    }

    init( ){
        this.refresh( );
    }

    refresh( ) {
        this.render( );
        this.setupIntersectionObserver( );
    }


    render( ) {
        const mainList = document.createElement( 'div' );
        mainList.className = 'ui vertical accordion sections scroll-box m-0';
        mainList.id = 'results';

        const dataToRender = this.filteredData || this.data.live_events;

        if( dataToRender ){
            Object.entries(dataToRender).forEach(([sportId, sportInfo]) => {
                if (sportInfo.show && sportInfo.count) {
                    mainList.appendChild(this.createSportSection(sportId, sportInfo));
                }
            });
        }

        morphdom( this.container, mainList );
    }

    /**
     * Метод для сброса фильтрации
     */
    resetFilter( ) {
        this.filteredData = null; // Сбрасываем отфильтрованные данные
        this.query = null;
    }

    createSportSection(sportId, sportInfo) {
        const section = document.createElement('div');
        section.className = 'sport-section mb-3 item';
        section.dataset.id = sportId;

        // Вычисляем высоту контейнера спорта
        const headerHeight = 0; // Высота заголовка вида спорта
        const competitionHeaderHeight = 52; // Высота заголовка каждого турнира
        const eventHeight = 86.39; // Высота одного события
        let totalHeight = headerHeight; // Начинаем с высоты заголовка спорта

        // Добавляем высоту для каждого турнира и его событий
        Object.entries(sportInfo.competitions).forEach(([compId, compInfo]) => {
            if (compInfo.show && compInfo.count) {
                totalHeight += competitionHeaderHeight; // Заголовок турнира
                const eventCount = Object.keys(compInfo.events).length;
                totalHeight += eventCount * eventHeight; // События в турнире
            }
        });

        // Создаем заголовок вида спорта
        section.innerHTML = `
            <div class="title-sport d-flex align-items-center justify-content-between title active p-3 bg-white sticky-top">
                <span class="d-flex gap-2">
                    <img src="${sportInfo.logo}" style="width: 16px;">
                    ${sportInfo.name}
                </span>
                <i class="icon dropdown m-0 fs-75"></i>
            </div>
            <div class="content active" style="min-height: ${totalHeight}px;">
                <div class="sportline-events-list-container" data-lazy-load="true"></div>
            </div>
        `;
        return section;
    }


    setupIntersectionObserver() {
        if (!this.observer) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        if (target.dataset.lazyLoad === "true") {
                            this.loadCompetitions(target);
                            this.observer.unobserve(target);
                        }
                    }
                });
            }, {
                root: null,
                rootMargin: "0px",
                threshold: 0.1
            });
        }

        // Наблюдаем за всеми контейнерами с data-lazy-load="true"
        document.querySelectorAll('[data-lazy-load="true"]').forEach((container) => {
            this.observer.observe(container);
        });
    }

    loadCompetitions(container) {
        const sportId = container.closest('.sport-section').dataset.id;
        const sportInfo = this.filteredData ? this.filteredData[sportId] : this.data.live_events[sportId];
        if (!sportInfo) return;

        // Загружаем турниры
        Object.entries(sportInfo.competitions).forEach(([compId, compInfo]) => {
            if (compInfo.show && compInfo.count) {
                container.appendChild(this.createCompetitionBlock(compId, compInfo));
            }
        });

        // Убираем атрибут lazy-load после загрузки
        container.removeAttribute("data-lazy-load");
    }

    createCompetitionBlock(compId, compInfo) {
        const block = document.createElement('div');
        block.className = 'sportline-events-list ui accordion m-0';
        block.dataset.id = compId;

        // Вычисляем высоту контейнера событий
        const eventCount = Object.keys(compInfo.events).length;
        const eventHeight = 86.39; // Высота одного события
        const totalHeight = eventCount * eventHeight;

        block.innerHTML = `
            <div class="sport-event-list-league-headline title active p-3 justify-content-between sticky-league">
                <div class="sport-event-list-league-headline-label gap-2">
                    <img src="${compInfo.logo}" style="width: 16px;">
                    <span class="text-truncate">${compInfo.name}</span>
                </div>
                <div class="d-flex align-items-center fs-8">
                    ${compInfo.scores?.subScores?.map((item, i) => `
                        ${item.scoreIndex < 15 ? '<div class="spacer"></div>' : ''}
                        <div class="d-flex justify-content-center" style="width: 24px;">
                            ${item.scoreIndex > 15 ? (i + 1) : (item.title === 'overtime' ? 'OT' : (item.title === 'penalty' ? 'PT' : ''))}
                        </div>
                    `).join('') ?? ''}
                    <div class="spacer"></div>
                    <div class="d-flex justify-content-center total-score">Result</div>
                    <i class="icon dropdown m-0 ms-1"></i>
                </div>
            </div>
            <div class="events-container content active" data-lazy-load="true" style="min-height: ${totalHeight}px;"></div>
        `;

        // Наблюдаем за events-container
        const eventsContainer = block.querySelector('.events-container');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.loadEvents(eventsContainer, compInfo);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: "0px",
            threshold: 0.1
        });

        observer.observe(eventsContainer);

        return block;
    }

    loadEvents(container, compInfo) {
        Object.entries(compInfo.events).forEach(([eventId, event]) => {
            container.appendChild(this.createEventBlock(event, compInfo.scores));
        });

        // Убираем атрибут lazy-load после загрузки
        container.removeAttribute("data-lazy-load");
    }

    createEventBlock(event, scores) {
        const eventBlock = document.createElement('div');
        eventBlock.className = 'sportline-event-block';
        eventBlock.innerHTML = `
            <div class="sportline-event-block-container p-3">
                <div class="d-flex align-items-center gap-2 justify-content-between">
                    <div class="d-flex gap-3 align-items-center flex-grow">
                        <div class="d-flex flex-column fs-8 align-items-center date-box">
                            <span>${new Date(event.startTime * 1000).toLocaleDateString()}</span>
                            <span class="text-secondary">${new Date(event.startTime * 1000).toLocaleTimeString()}</span>
                        </div>
                        <a href="/event/${event.id}" class="sportline-event-competitor-name">
                            <span class="d-flex flex-column gap-2">
                                <span class="d-flex">${event.team1}</span>
                                <span class="d-flex">${event.team2}</span>
                            </span>
                        </a>
                    </div>
                    <div class="d-grid align-items-center fs-8 scores-box">
                        <div class="d-flex flex-column fs-75">
                            <div class="d-flex flex-fill justify-content-center">
                                ${scores?.subScores?.map((item, i) => `
                                    ${item.scoreIndex < 15 ? '<div class="splitter"></div>' : ''}
                                    <div class="d-flex flex-column" style="width: 24px;">
                                        <div class="d-flex justify-content-center py-1">${event.scores?.subScores?.[i]?.score1 ?? '-'}</div>
                                        <div class="d-flex justify-content-center py-1">${event.scores?.subScores?.[i]?.score2 ?? '-'}</div>
                                    </div>
                                `).join('') ?? ''}
                            </div>
                        </div>
                        <div class="splitter h-100"></div>
                        <div class="d-flex flex-column fs-75 total-score">
                            <div class="d-flex flex-fill justify-content-center">
                                <div class="d-flex flex-column fw-bold">
                                    <div class="d-flex justify-content-center py-1">${event.scores?.score1 ?? ''}</div>
                                    <div class="d-flex justify-content-center py-1">${event.scores?.score2 ?? ''}</div>
                                </div>
                            </div>
                        </div>
                        <i class="icon dropdown m-0 ms-1" style="opacity: 0.22;"></i>
                    </div>
                </div>
            </div>
        `;
        return eventBlock;
    }


    /**
     * Метод для выполнения поиска
     * @param {string} query - Строка поиска
     */
    search(query) {
        if (!query) {
            this.filteredData = null; // Если запрос пустой, сбрасываем фильтр
            this.render();
            this.setupIntersectionObserver(); // Перенастраиваем IntersectionObserver
            return;
        }

        this.query = query;

        const lowerCaseQuery = query.toLowerCase();
        const filteredData = {};

        // Проверяем наличие свойств kindsport и competition
        const hasKindsport = !!this.data.kindsport;
        const hasCompetition = !!this.data.competition;

        Object.entries(this.data.live_events).forEach(([sportId, sportInfo]) => {
            const sportName = sportInfo.name.toLowerCase();

            // Если kindsport задан, пропускаем другие виды спорта
            if (hasKindsport && sportName !== this.data.kindsport.toLowerCase()) {
                return;
            }

            const isSportMatch = sportName.includes(lowerCaseQuery); // Частичное совпадение с видом спорта

            const filteredCompetitions = {};

            // Если есть совпадение с видом спорта, включаем все турниры и события
            if (isSportMatch) {
                Object.entries(sportInfo.competitions).forEach(([compId, compInfo]) => {
                    filteredCompetitions[compId] = { ...compInfo }; // Включаем все турниры
                });
            } else {
                // Иначе выполняем обычный поиск по турнирам и событиям
                Object.entries(sportInfo.competitions).forEach(([compId, compInfo]) => {
                    const compName = compInfo.name.toLowerCase();

                    // Если competition задан, пропускаем другие турниры
                    if (hasCompetition && compName !== this.data.competition.toLowerCase()) {
                        return;
                    }

                    const isCompMatch = compName.includes(lowerCaseQuery); // Частичное совпадение с турниром

                    const filteredEvents = {};

                    // Если есть совпадение с турниром, включаем все события
                    if (isCompMatch) {
                        Object.entries(compInfo.events).forEach(([eventId, event]) => {
                            filteredEvents[eventId] = event; // Включаем все события
                        });
                    } else {
                        // Иначе выполняем обычный поиск по событиям
                        Object.entries(compInfo.events).forEach(([eventId, event]) => {
                            const eventName = `${event.team1} ${event.team2}`.toLowerCase();
                            const isEventMatch = eventName.includes(lowerCaseQuery);

                            if (isEventMatch) {
                                filteredEvents[eventId] = event;
                            }
                        });
                    }

                    // Если найдены события или турнир соответствует запросу
                    if (Object.keys(filteredEvents).length > 0 || isCompMatch) {
                        filteredCompetitions[compId] = {
                            ...compInfo,
                            events: filteredEvents
                        };
                    }
                });
            }

            // Если найдены турниры или вид спорта соответствует запросу
            if (Object.keys(filteredCompetitions).length > 0 || isSportMatch) {
                filteredData[sportId] = {
                    ...sportInfo,
                    competitions: filteredCompetitions
                };
            }
        });

        this.filteredData = filteredData;
        this.refresh( );
    }

    initSearchEvent( ){

        document.addEventListener( 'input', ( event ) => {

            const target = event.target.closest( '.search-panel-input' );
            if( !target ) return;

            const query = target.value.trim( );
            const queryLength = query.length;

            if( queryLength < 3 ){
                if( this.query ){
                    this.resetFilter( );
                    this.refresh( ); 
                }
                return;
            }

            this.search( query );
            
        }, true );

    }

    initClearSearch( ){

        document.addEventListener( 'click', ( event ) => {

            const target = event.target.closest( '.search-panel [resource-name="close"]' );
            if( !target ) return;

            target.closest( '.search-panel' ).querySelector( 'input' ).value= '';

            if( this.query ){
                this.resetFilter( );
                this.refresh( ); 
            }
            
        }, true );

    }

    initAccordion( ){

        if( this.acc ) return;

        this.acc = new Accordion( `${this.selector}.accordion.sections`, {
            
            selector: {
                trigger: '.title .icon',
                content: '.content'
            },
            onOpen: ( title, el ) => {
                if( this.data.live_events[ title ] ) this.data.live_events[ title ].expand_sport = true;
            },
            onClose: ( title, el ) => {
                if( this.data.live_events[ title ] ) this.data.live_events[ title ].expand_sport = false;
            },
            exclusive: false

        });
    }

    handleNavigationUpdate = ( event ) => {

        this.refresh( );

    }
}

export default Results;
