const vm = new Vue({
  el: '#book',
  data: {
    old_version: '',
    items: [],
    newName: '',
    newBalance: '',
    totalBill: 0.0,
    newDate: '',
    myDate: new Date()
  },
  mounted: function(){
    this.loadTodo();
    this.calTotal();
    this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];

    // version check
    this.checkVersion();
  },
  methods: {
    checkVersion: function(){
        this.old_version = JSON.parse(localStorage.getItem('version'));
        if(!this.old_version){
            this.old_version = {'version' : '0'};
        }
        if($('#current_version').text() != this.old_version['version']){
            alert('version up !');
            localStorage.setItem('version', JSON.stringify({
                'version' : $('#current_version').text()
            }));
        }
    },
    calTotal: function(){
        this.totalBill = 0.0;
        for(var i = 0; i < this.items.length; i++){
            this.totalBill += parseFloat(this.items[i].balance);
        }
    },
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

        this.calTotal();
    },
    loadTodo: function(){
        this.items = JSON.parse( localStorage.getItem('items') );
        if(!this.items){
            this.items = [];
        }
    }
  }
})