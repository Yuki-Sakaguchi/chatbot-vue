
/**
 * vueの検索機能
 */
var vuesearch = vuesearch || {};
vuesearch.app = {
    el: '#app',
    data: {
        keyword: '',
        oldKeyword: '',
        keyupStack: [],
        className: {
            main: 'chatbot',
            active: 'js-active'
        },
    },
    
    /**
     * インスタンス初期化時にベースとなるDOMを作る
     */
    beforeCreate: function() {
        // インスタンス初期化前なので、無理やりデータを引っこ抜く
        var $el = $(this.$options.el);
        var className = this.$options.data().className;

        // 必要なDOMを画面に表示。cssで非表示にしているのでまだ表示はされない
        var $wrap = $('<div>').addClass(className.main +'__wrap');
        $el.append($wrap);

        // 村長からの一言
        $wrap.append(
            '<div class="' + className.main + '__row">'
            +   '<div class="' + className.main + '__img">'
            +       '<img src="/images/faq/circle-img.png" alt="とんがり村長">'
            +   '</div>'
            +   '<div class="' + className.main + '__comment--green">'
            +       'トンガリ島について教えるぞ！質問を入力するのじゃ。'
            +   '</div>'
            + '</div>'
        );

        // ユーザの入力フォーム
        $wrap.append(
            '<div class="' + className.main + '__row">'
            +   '<div class="' + className.main + '__comment">'
            +       '<input type="text" id="inputbox" v-on:keyup="search" v-model="keyword" placeholder="検索ワードを入力してください。">'
            +   '</div>'
            + '</div>'
        );

        // 後から追加される要素にscrollイベントをつけるようにする
        $(document).on('click', '.js-scroll', function() {
            var speed = 500;
            var href = $(this).attr("href");
            var target = $(href == "#" || href == "" ? 'html' : href);
            var position = target.offset().top;

            // アコーディオンを開く
            var $acTarget =  $(target);
            var $next = $acTarget.next('.js-accordion-body');
            $acTarget.addClass(className);
            $next.addClass(className).slideDown();
            
            $("html, body").animate({
                scrollTop: position
            }, speed, "swing");

            return false;
        });
    },

    /**
     * マウント直後にベースとなるDOMを画面に表示する
     */
    mounted: function() {
        var self = this;
        var $wrap = $('.' + self.className.main +'__wrap');
        var $row = $('.' + self.className.main +'__row');

        setTimeout(function() {
            // 表示領域の表示
            $wrap.slideDown(500);
            setTimeout(function() {
                // コメントを順々に表示
                $row.each(function(i) {
                    var $this = $(this);
                    setTimeout(function() {
                        $this.addClass(self.className.active);
                    }, 500*i);
                });
            }, 700);
        }, 200);
    },

    methods: {
        /**
         * 検索
         */
        search: function(e) {
            var self = this;

            // キーボードの入力が終わってから500ミリ秒たったら検索が走る
            self.keyupStack.push(1);
            setTimeout(function() {
                self.keyupStack.pop();
                if (self.keyupStack.length == 0) {
                    // 前回の検索時と入力値が変わらなければそのまま終了
                    if (self.oldKeyword.trim() == self.keyword.trim()) {
                        return false;
                    }

                    // 入力値を保存
                    self.oldKeyword = self.keyword;

                    // 検索
                    var result = self.findBy();

                    // 結果表示
                    self.drawResult(result);

                    // 入力カウントを初期化
                    self.keyupStack = [];
                }
            }, 500);
        },

        /**
         * 結果表示
         */ 
        drawResult: function(list) {
            var self = this;

            // 前回の結果を非表示に
            $('.js-result').remove();

            // 囲いを取得
            var $wrap = $('.' + self.className.main +'__wrap');
            
            // コメントの構成
            var createHmlt = function(text) {
                return '<div class="' + self.className.main + '__row js-result">'
                     +     '<div class="' + self.className.main + '__img">'
                     +         '<img src="/images/faq/circle-img.png" alt="とんがり村長">'
                     +     '</div>'
                     +     '<div class="' + self.className.main + '__comment--green ' + self.className.main + '__ansarea">' + text + '</div>'
                     + '</div>';
            };
            
            // 文言
            var html = [];
            if (self.replaceAll(self.keyword.trim(), '　', ' ') == 'ラフテル 場所') {
                html.push(createHmlt('<p>それは...</p>'));
                html.push(createHmlt('<p>　...　</p>'));
                html.push(createHmlt('<p>　...　</p>'));
                html.push(createHmlt('<p>教えられんのじゃ...</p>'));
            } else if (self.replaceAll(self.keyword.trim(), '　', ' ').indexOf('おはよう') != -1) {
                html.push(createHmlt('<p>元気がよいの！！！</p>'));
            } else if (self.replaceAll(self.keyword.trim(), '　', ' ') == '尾田先生') {
                html.push(createHmlt('<p>神じゃ...</p>'));
            } else if (self.replaceAll(self.keyword.trim(), '　', ' ') == '昔々') {
                html.push(createHmlt('<p>あるところに...</p>'));
            } else if (self.replaceAll(self.keyword.trim(), '　', ' ') == 'test') {
                for (var i = 0; i < 5; i++) {
                    html.push(createHmlt('<p>test</p>'));
                }
            } else if (self.keyword.length == 0) {
                // 結果なし
                html.push(createHmlt('<p>何か気になることはないのか？</p>'));
            } else if (list.length > 0) {
                // 結果あり
                if (list.length > 10) {
                    // 答え多すぎ
                    html.push(createHmlt('<p>こたえがたくさんあるときは、<br>検索キーワードをかえてみるのじゃ</p>'));
                } else {
                    html.push(createHmlt('<p>質問がヒットしたようじゃ</p>'));
                }
                var tmp = '';
                list.forEach(function(e) { tmp += '<a href="#q' + e.qId + 'a' + e.aId + '" class="js-scroll ' + self.className.main + '__ans">' + e.q + '</p>'; });
                html.push(createHmlt(tmp));
            } else {
                // 該当なし
                html.push(createHmlt('<p>ここには答えがないようじゃのう。</p>'));
                html.push(createHmlt('<p><a class="' + self.className.main + '__ans" href="/">パークに直接問い合わせる</a></p>'));
            }
            
            // htmlに追加
            html.forEach(function(e, i) {
                var $html = $(e);
                $wrap.append($html);
    
                // 順番にアニメーションしつつ表示
                setTimeout(function() {
                    $html.addClass(self.className.active);
                }, 500*i);
            });
        },

        /**
         * 該当の答えをフィルタリング
         */
        findBy: function () {
            // 入力がない場合は非表示
            if (!this.keyword) return false;
    
            // 単語をスペースで分離
            var words = this.replaceAll(this.keyword.trim(), '　', ' ').split(' ');

            if (words.length > 1) {
                // 単語が複数ある場合は全て含まれるものだけを表示
                return this.items.filter(function(item) {
                    var tmp = item['q'] + item['a'];
                    var isIndex = false;
                    var i = 0;

                    // 一致最後までtrueだったら一致
                    do {
                        // 単語がなくなったらループ終了
                        if (!words[i]) break;
                        isIndex = tmp.indexOf(words[i]) != -1;
                        i++;
                    } while (isIndex);

                    return isIndex;
                });
            } else {
                // １単語
                return this.items.filter(function(item) {
                    var tmp = item['q'] + item['a'];
                    return tmp.indexOf(words[0]) != -1;
                });
            }
        },
    
        /**
         * 置き換え
         */
        replaceAll: function(str, before, after) {
            return str.split(before).join(after);
        },
    }
};