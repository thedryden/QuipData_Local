/*	Does basic math on numeric arrays. Arrays must contain only either "null"
 * 	or numeric values. A null value is "", undefined, NaN, or null.
 * 
 * 	REQUIRES JQUERY: jQuery's $.isNumeric function is used extensively.	
 */
function ArrayMath(){};

ArrayMath.prototype = {
	//calculate the mean of a number Array
	mean : function( _a ){
	    var len = 0;
	    var sum = 0;
	    
	    for( var i = 0; i < _a.length; i++ )    {
	          if ( _a[i] == "" || _a[i] == undefined ){
	          	//Do Nothing
	          }
	          else if (!$.isNumeric(_a[i]))
	          {
	              return undefined;
	          }
	          else
	          {
	             len++;
	             sum += parseFloat(_a[i]); 
	          }
	    }
	
	    return sum / len;
	}
	
	, variance : function( _a ){
	    var mean = ArrayMath.mean( _a );
		var len = 0;
		
		if( mean == undefined )
			return undefined;
			
		var v = 0;
		for( var i = 0; i <_a.length; i++ ){
			if ( _a[i] === "" || _a[i] == undefined ){
				//Do Nothing
			} else {
				len++;
				v += (_a[i] - mean) * (_a[i] - mean);              
			}    
		}
		    
		return v / len;
	}
	
	, max : function( _a ){
	    var max = null;
	    
	    for( var i = 0; i < _a.length; i++ ){
	          if ( _a[i] === "" || _a[i] == undefined ){
	          	//Do Nothing
	          } else if ( !$.isNumeric(_a[i]) ) {
	              return undefined;
	          } else {
	             if ( max === null || _a[i] > max) 
	             	max = _a[i];
	          }
	    }
	
	    return max;    
	}
	
	, min : function(_a){
	    var min = null;
	    
	    for( var i=0; i< _a.length; i++ ){
	          if ( _a[i] === "" || _a[i] == undefined ){
	          	//Do Nothing
	          } else if ( !$.isNumeric( _a[i] ) ){
	              return undefined;
	          } else {
				if( min === null || min > _a[i] )
					min = _a[i];
	          }
	    }
	
	    return min;
	}
	
	//Standard deviation
	, stDev : function( _a ){
		return Math.sqrt( ArrayMath.variance( _a ) );
	}
	
	//Standard error
	, stError : function( _a ){
		return Math.sqrt( ArrayMath.variance( _a ) ) / _a.length-1;
	}
	
	//Counts number of elements excluding "Null"
	//returns undefined if there is a non-null non-numeric value
	, nonNullLength : function( _a ){
		var len = 0;
		for( var i = 0; i< _a.length; i++ ){
			if ( _a[i] === "" || _a[i] == undefined ){
				//Do Nothing
			} else if ( !$.isNumeric( _a[i] ) ){
				return undefined;
			} else {
				len++;
			}
		}
	}
	
	//Returns true if all values in the array are either numeric or null
	, isNumeric : function( _a ){
		return ( nonNullLength( _a ) == undefined ) ? false : true;
	}
	
	, median : function(_a){
		var _a = _a.slice(0);
	    
	    _a.sort(function(a,b){return a-b});
	    
	    var median = 0;
	    
	    if (_a.length % 2 == 1)
	    {
	        median = _a[ ( _a.length +1 ) / 2 - 1 ];
	    }
	    else
	    {
	        median = ( 1 * _a[ _a.length / 2 - 1 ] + 1 * _a[ _a.length / 2 ] ) / 2;
	    }
	    
	    return median
	}
}

var ArrayMath = new ArrayMath();