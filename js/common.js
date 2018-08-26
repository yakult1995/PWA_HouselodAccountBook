function checkVersion(){
    var current_version = $('#current_version').text().replace('.', '-').split('-')[1];
    alert(current_version);
}

const vm = new Vue({
  el: '#book',
  data: {
    items: [],
    newName: '',
    newBalance: '',
    newDate: '',
    myDate: new Date()
  },
  mounted: function(){
    this.loadTodo();
    this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];
  },
  methods: {
    addTodo: function(newName, newBalance, newDate){
        this.items.push({
            name: newName,
            balance: newBalance,
            date: newDate
        });
        this.newName = '';
        this.newBalance = '';
        this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];
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
        // sort
        this.items.sort(function(a, b){
            if(a.date < b.date) return 1;
            if(a.date > b.date) return -1;
            return 0;
        });

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