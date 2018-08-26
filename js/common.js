function checkVersion(){
    var current_version = $('#current_version').text().replace('.', '-').split('-')[1];
    alert(current_version);
}

const vm = new Vue({
  el: '#book',
  data: {
    items: [],
    newName: '',
    newBalance: ''
  },
  mounted: function(){
    this.loadTodo();
  },
  methods: {
    addTodo: function(newName, newBalance){
        this.items.push({
            name: newName,
            balance: newBalance
        });
        this.newName = '';
        this.newBalance = '';
        this.saveTodo();
    },
    deleteTodo: function(ele){
        if(confirm(ele.name + 'を削除しますか？')){
            this.items = this.items.filter(function(item){
                return item.name != ele.name;
            })
            this.saveTodo();
        }
    },
    saveTodo: function(){
        localStorage.setItem('items', JSON.stringify(this.items));
    },
    loadTodo: function(){
        this.items = JSON.parse( localStorage.getItem('items') );
            if( !this.items ){
            this.items = [];
            }
        }
    }
})