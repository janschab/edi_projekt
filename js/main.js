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

    const State = {
        userIds: new Set(),
        userId: undefined,
        color: DEFAULT_COLOR
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
                const template = $('.color').clone().removeClass('d-none');
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
                const template = $('.todo').clone().removeClass('d-none');
                $('#todos').empty();

                todos.forEach((todo) => {
                    const todoTpl = template.clone();
                    if (!todo.completed) {
                        todoTpl.find('.todo__indicator__inside').removeClass('todo__indicator__active');
                    }
                    todoTpl.find('.todo__content').text(todo.title);
                    todoTpl.find('.todo__indicator, .todo__indicator__active').css({
                        backgroundColor: State.color
                    });

                    todoTpl.appendTo('#todos');
                });
            },
            addClickListener: () => {
                $('body').on('click', '.todo__indicator', (event) => {
                    console.log($(event.currentTarget).find('.todo__indicator__inside'));
                    $(event.currentTarget).find('.todo__indicator__inside')
                        .toggleClass('todo__indicator__active')
                        .css({
                            backgroundColor: State.color
                        });
                });
            }
        }
    };

    Api.getColors().then(({data}) => {
        Controller.colors.render(data);

        State.color = data[0].color;
    });

    Api.getTodos().then((todos) => {
        todos.forEach(({userId}) => {
            State.userIds.add(userId);
        });

        State.userId = State.userIds.values().next().value;

        Controller.todos.render(todos.filter((todo) => {
            return todo.userId === State.userId;
        }));
    });

    Controller.colors.addClickListener();
    Controller.todos.addClickListener();

});
