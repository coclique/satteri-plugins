grammar RubyDirectiveBody;

root: segment* EOF;
segment: divider | annot | plain;

divider: '/';
annot: stretch '(' stretch ')';
plain: stretch;

stretch: CHAR+;

CHAR: '&' . | .;