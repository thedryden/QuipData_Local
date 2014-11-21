suite('"About" Page Tests', function() {
	test('page should contain link to contact page', function() {
		assert($('a[href="/contact"]').length);
	});
	// this is just a dummy example of what additional tests may look like
	test('this doesn\'t test anything', function() {
		assert(true);
	});
});