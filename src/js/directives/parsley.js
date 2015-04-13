angular.module('app').directive('parsleyValidateInput', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            element.on('remove', function() {
                return element.closest('form').parsley('removeItem', "#" + attrs.id);
            });

            function makeid()
            {
                var text = "";
                var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < 10; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }
            
            return $timeout(function() {
                if (!attrs.id) {
                    attrs.id = "input_" + (makeid());
                    element.attr('id', attrs.id);
                }
                return element.closest('form').parsley('addItem', "#" + attrs.id);
            });
        }
    };
});