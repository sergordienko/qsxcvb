class VirtualScroll {

    constructor(selector, data) {
        this.selector = selector;
        this.container = document.querySelector( selector );
        this.data = data;
        this.htmlGenerator = new HTMLGenerator(data);
        //this.favouriteManager = new FavouriteManager(data);

        this.initAccordion( );
        document.addEventListener( 'navigationUpdate', this.handleNavigationUpdate );
    }

    init( ){
        this.refresh( );
        this.initIntersectionObserver( );
    }

    refresh( ){
        this.render();
    }

    render() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => {
            morphdom(this.container, this.htmlGenerator.createHtmlContent( this.selector.replace( /#/g, '') ), { childrenOnly: true });
            this.animationFrameId = null;
            this.observeCompetitions();
        });
    }

    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.2,
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const competitionElement = entry.target;
                    const kindsport = competitionElement.closest('.sport-section').dataset.kindsport;
                    const competition = competitionElement.dataset.competition;
                    const sportinfo = this.data.live_events[kindsport];
                    const competitioninfo = sportinfo.competitions[competition];

                    competitionElement.innerHTML = this.htmlGenerator.generateCompetitionBlock(kindsport, competition, competitioninfo);
                    this.observer.unobserve(competitionElement);
                }
            });
        }, options);

        this.observeCompetitions();
    }

    observeCompetitions( ) {
        document.querySelectorAll('.competition').forEach(competition => {
            this.observer.observe(competition);
        });
    }

    handleNavigationUpdate = ( event ) => {

        this.refresh( );

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



}

export default VirtualScroll;
