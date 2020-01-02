$(document).ready(() => {
    const DEFAULT_COLOR = '#30302f';

    const Http = {
        get: (url) => {
            return new Promise((res, rej) => {
                $.ajax({
                    url,
                    type: "GET",
                    success: (response) => {
                        res(response);
                    },
                    error: (err) => {
                        rej(err);
                    }
                });
            });
        }
    };

    const Helpers = {
        hslaArray: (length) => {
            const array = new Array(length);
            for (let i = 0; i < length; i++) {
                array[i] = `hsla(${360 * (i + 1) / (length + 1)}, 100%, 70%, 0.5)`;
            }
            return array;
        }
    };

    const State = {
        userIds: undefined,
        userId: undefined,
        color: DEFAULT_COLOR,
        charts: {}
    };

    const Api = {
        getColors: () => {
            return Http.get("https://reqres.in/api/unknow");
        },
        getTodos: () => {
            return Http.get("https://jsonplaceholder.typicode.com/todos");
        }
    };

    const Controller = {
        colors: {
            render(color) {
                const template = $('.color').first().clone().removeClass('d-none');
                $('#colors').empty();

                color.forEach((colorData) => {
                    const colorTpl = template.clone().css({
                        backgroundColor: colorData.color
                    });
                    colorTpl.data({
                        color: colorData.color
                    });

                    colorTpl.appendTo('#colors');
                });
            },
            addClickListener: () => {
                $('body').on('click', '.color', (event) => {
                    const color = $(event.currentTarget).data().color;
                    State.color = color;
                    $('.todo__indicator, .todo__indicator__active').css({
                        backgroundColor: color
                    });
                });
            }
        },
        todos: {
            render: (todos) => {
                const template = $('.todo').first().clone().removeClass('d-none');
                $('#todos').empty();

                const chart = {
                    bar: {
                        type: 'bar',
                        name: 'Todos',
                        labels: ['zrobione', 'do zrobienia'],
                        values: [0, 0]
                    }, pie: {
                        type: 'pie',
                        name: 'długości zadań',
                        labels: [],
                        values: [],
                        data: new Map()
                    }
                };

                todos.forEach((todo) => {
                    const todoTpl = template.clone();
                    todoTpl.find('.todo__indicator__inside').toggleClass('todo__indicator__active', todo.completed);
                    todoTpl.find('.todo__content').text(todo.title);
                    todoTpl.find('.todo__indicator, .todo__indicator__active').css({
                        backgroundColor: State.color
                    });

                    chart.bar.values[todo.completed ? 0 : 1]++;
                    if (chart.pie.data.has(todo.title.length)) {
                        chart.pie.data.set(todo.title.length, chart.pie.data.get(todo.title.length) + 1);
                    } else {
                        chart.pie.data.set(todo.title.length, 1);
                    }
                    todoTpl.appendTo('#todos');
                });

                chart.pie.data.forEach((value, key) => {
                    chart.pie.labels.push(key);
                    chart.pie.values.push(value);
                });

                if (State.charts[chart.bar.type]) {
                    Controller.chart.update(chart.bar);
                } else {
                    Controller.chart.render(chart.bar);
                }

                if (State.charts[chart.pie.type]) {
                    Controller.chart.update(chart.pie);
                } else {
                    Controller.chart.render(chart.pie);
                }
            },
            addClickListener: () => {
                $('body').on('click', '.todo__indicator', (event) => {
                    $(event.currentTarget).find('.todo__indicator__inside')
                        .toggleClass('todo__indicator__active')
                        .css({
                            backgroundColor: State.color
                        });
                    if ($(event.currentTarget).find('.todo__indicator__active').length) {
                        State.charts.bar.data.datasets[0].data[0]++;
                        State.charts.bar.data.datasets[0].data[1]--;
                    } else {
                        State.charts.bar.data.datasets[0].data[0]--;
                        State.charts.bar.data.datasets[0].data[1]++;
                    }
                    State.charts.bar.update();
                });

                const checkButtonStatus = () => {
                    $('#next-button')[0].toggleAttribute('disabled', !State.userIds.isNext());
                    $('#prev-button')[0].toggleAttribute('disabled', !State.userIds.isPrev());
                };
                checkButtonStatus();

                $('#prev-button').on('click', () => {
                    State.userId = State.userIds.prev().getCurrent();
                    Controller.todos.render(State.todos.filter((todo) => {
                        return todo.userId === State.userId;
                    }));
                    checkButtonStatus();
                });

                $('#next-button').on('click', () => {
                    State.userId = State.userIds.next().getCurrent();
                    Controller.todos.render(State.todos.filter((todo) => {
                        return todo.userId === State.userId;
                    }));
                    checkButtonStatus();
                });
            }
        },
        chart: {
            render: ({name, labels, values, type}) => {
                const ctx = document.getElementById(type + 'Chart').getContext('2d');
                State.charts[type] = new Chart(ctx, {
                    type,
                    data: {
                        labels,
                        datasets: [{
                            label: name,
                            data: values,
                            backgroundColor: Helpers.hslaArray(values.length),
                            borderColor: Helpers.hslaArray(values.length),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: type === 'bar' ? {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        } : undefined
                    }
                });
            },
            update: ({name, labels, values, type}) => {
                State.charts[type].data.labels = labels;
                State.charts[type].data.datasets = [{
                    label: name,
                    data: values,
                    backgroundColor: Helpers.hslaArray(values.length),
                    borderColor: Helpers.hslaArray(values.length),
                    borderWidth: 1
                }];
                State.charts[type].update();
            }
        }
    };

    Api.getColors().then(({data}) => {
        Controller.colors.render(data);

        State.color = data[0].color;
    });

    Api.getTodos().then((todos) => {
        const userIdsSet = new Set();
        todos.forEach(({userId}) => {
            userIdsSet.add(userId);
        });
        State.userIds = new IdsArray(...userIdsSet.values());

        State.todos = todos;

        State.userId = State.userIds.getCurrent();

        Controller.todos.render(todos.filter((todo) => {
            return todo.userId === State.userId;
        }));

        Controller.colors.addClickListener();
        Controller.todos.addClickListener();
    });

});
