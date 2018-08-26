function checkVersion(){
    var current_version = $('#current_version').text().replace('.', '-').split('-')[1];
    alert(current_version);
}

const vm = new Vue({
  el: '#todo',
  data: {
    items: [
    ],
    newItemTitle: '',
    canTnter: false
  },
  mounted: function(){
    this.loadTodo();
  },
  methods: {
    checkJapanese: function(){
        this.canTnter = true;
    },
    addTodo: function(newTitle){
        if(!this.canTnter)return;
        this.items.push({
            title: newTitle,
            isChecked: false
        });
        this.newItemTitle = '';
        this.canTnter = false;
        this.saveTodo();
    },
    deleteTodo: function(ele){
        if(confirm(ele.title + 'を削除しますか？')){
            this.items = this.items.filter(function(item){
                return item.title != ele.title;
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