function selectRibbon( _name ){
	$('.ribbon_tab_selected').each( function(){
		$(this).removeClass( 'ribbon_tab_selected' )
			.addClass( 'ribbon_tab' );
	});
	
	$('.ribbon').each(function(){
		$(this).hide();
	});
	
	$('#' + _name).show();
	$('#tab_' + _name).removeClass( 'ribbon_tab' )
		.addClass( 'ribbon_tab_selected' );
}

var objCloseAll = {};

function closeAllAdd( _name, _func ){
	objCloseAll[ _name ] = _func; 
}

function closeAll( _selected ){
	for( var ref in objCloseAll ){
		if( _selected !== ref )
			objCloseAll[ref]();
	}
}

function changeFontSelect( _value ){
	$('#selected_font_family').html( _value );
	$('#selected_font_family').css( "font-family", "'" + _value + "'" );
	$('#tb_font_family').hide();
}

function openFont(e){
	$( document ).on( "mousemove", function( e ) {
		var mouseTop = e.pageY;
		var mouseLeft = e.pageX;
		
		mouseTop += 40;
		mouseLeft -= ( $('#wandering_font_style').width() / 2 );
		
		$('#wandering_font_style').css({ top: mouseTop, left: mouseLeft })
		$('#wandering_font_style').show();
		$(document).off( "mousemove" );
	});
	
}

function closeFont(){
	$('#wandering_font_style').hide();
}

function fontStyleStyleClick( _style, _character ){
	var value = $('#font_style_style').val();
	value = value.replace( _character, '' );
	
	if( $('#' + _style).hasClass( 'font_style_style' ) ){
		$('#' + _style).addClass( 'font_style_style_selected' )
			.removeClass('font_style_style');
		
		value += _character;
	} else {
		$('#' + _style).removeClass( 'font_style_style_selected' )
			.addClass('font_style_style');
	}
	
	$('#font_style_style').val( value );
}

function openBlockingAlert( _message ){
	$('#block_div_message').html( _message );
	$('#block_div').show();
	$('#block_div_message').show();
}

function closeBlockingAlert(){
	$('#block_div').hide();
	$('#block_div_message').hide();
}

function strobeIcon(){
	
}

var canvasTextOnCloseCallback = null;

function openCanvasText( _x, _y, _defaultText, _closeOnEnter, _closeOnClick, _onKeypress, _onClose ){
	closeCanvasText();
	
	if( _defaultText == undefined )
		_defaultText = '';
		
	if( !$.isNumeric( _x ) || !$.isNumeric( _y ) ){
		throwError( 'layout.js', 'openCanvasText', '_x or _y parameter were not numeric' );
	} else {
		_x = parseInt( _x );
		_y = parseInt( _y );
	}
		
	$('#canvas_text').css({
			top: _y,
			left: _x
		})
		.val( _defaultText )
		.show()
		.focus()
		
	var width = canvasTextWidth();
	width = ( width < 20 ) ? 20 : width + 20;
	
	$('#canvas_text').width( width );
	
	$('#canvas_text').on( 'keydown.canvasTextWidth', function(){
		var width = canvasTextWidth();
		width = ( width < 20 ) ? 20 : width + 20;
	
		$('#canvas_text').width( width );
	});
	
	if( typeof _onKeypress === 'function' ){
		$('#canvas_text').on( 'keydown.canvasText', _onKeypress );
	}
	
	if( typeof _onClose === 'function' ){
		canvasTextOnCloseCallback = _onClose;
	} 

	if( _closeOnEnter && typeof _closeOnEnter === 'boolean' ){
		setTimeout( function(){ 
			$('#canvas_text').on( 'keypress.canvasText', function( e ){
				if( e.which == 13 || e.which == 10 ){
					setTimeout( function(){ closeCanvasText() }, 500 );
				}
			});
		}, 500 );
	}
	
	if( _closeOnClick && typeof _closeOnClick === 'boolean' ){
		setTimeout( function(){ 
			$("html").on( 'click.canvasText', function( e ){
				closeCanvasText()
			});
		}, 500 );
	}
}

function closeCanvasText(){
	$('#canvas_text').hide();
	
	if( typeof canvasTextOnCloseCallback === 'function' ){
		canvasTextOnCloseCallback( $('#canvas_text').val() );
	}
	
	canvasTextOnCloseCallback = null;
	
	$('#canvas_text').off( '.canvasText' );
	$('#canvas_text').off( '.canvasTextWidth' );
	$("html").off( '.canvasText' );
}

function canvasTextWidth(){
	$('#canvas_span').html( $('#canvas_text').val() );
	var width = $('#canvas_span').css('width');
	width = parseInt( stripChar( width ) );
		
	return width;
}
