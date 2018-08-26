function checkVersion(){
    var current_version = $('#current_version').text().replace('.', '-').split('-')[1];
    alert(current_version);
}

const vm = new Vue({
  el: '#todo',
  data: {
    items: [
        { title: '領収書を準備する', isChecked: true },
        { title: 'Vue.jsハンズオンの資料を作る', isChecked: true },
        { title: '参加者の人数を確認する', isChecked: false },
        { title: 'ピザを注文する', isChecked: false },
        { title: '参加費のお釣りを準備する', isChecked: false },
        { title: '会場設営をする', isChecked: false },
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