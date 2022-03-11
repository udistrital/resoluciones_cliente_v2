export const TablaResolucion: any = {
    Id: {
        hide: true,
    },
    NumeroResolucion: {
        title: 'Número',
        width: '10%',
        editable: false,
    },
    Vigencia: {
        title: 'Vigencia',
        filter: {
            type: 'checkbox',
            config: {
                true: 'Yes',
                false: 'No',
                resetText: 'clear',
            },
        },
        width: '10%',
        editable: false,
    },
    Facultad: {
        title: 'Facultad',
        filter: {
            type: 'completer',
            config: {
                completer: {
                    searchFields: 'email',
                    titleField: 'email',
                },
            },
        },
        width: '20%',
        editable: false,
    },
    TipoResolucion: {
        title: 'Tipo de resolución',
        filter: {
            type: 'list',
            config: {
                selectText: 'Select...',
                list: [
                    { value: 'Glenna Reichert', title: 'Glenna Reichert' },
                    { value: 'Kurtis Weissnat', title: 'Kurtis Weissnat' },
                    { value: 'Chelsey Dietrich', title: 'Chelsey Dietrich' },
                ],
            },
        },
        width: '20%',
        editable: false,
        passed: true,
    },
    NivelAcademico: {
        title: 'Nivel',
        width: '14%',
        editable: false,
    },
    Dedicacion: {
        title: 'Dedicación',
        width: '10%',
        editable: false,
    },
    Estado: {
        title: 'Estado',
        width: '14%',
        editable: false,
    },
};