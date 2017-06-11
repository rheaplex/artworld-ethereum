BUILD_DIR = environments/production/build
SRC_DIR = app
INCLUDE_DIR = ../shared

JS_EXCLUDE := $(INCLUDE_DIR)/js/shared-mock.js

# Note precedence of JS and CSS wildcards
JS := $(wildcard $(INCLUDE_DIR)/js/*.js) $(wildcard $(SRC_DIR)/*.js)
JS := $(filter-out $(JS_EXCLUDE), $(JS))

CSS := $(wildcard $(INCLUDE_DIR)/css/*.css) $(wildcard $(SRC_DIR)/*.css)

HTML := $(wildcard $(SRC_DIR)/*.html)

all: $(BUILD_DIR)/app.html $(BUILD_DIR)/app.js $(BUILD_DIR)/app.css

$(BUILD_DIR)/app.html: $(HTML)
	cat $(HTML) > $(BUILD_DIR)/app.html
	# Strip one-liners but not multi-liners.
	perl -i -p -e 's/\s*<link[^>]+rel="stylesheet">\n//g' $(BUILD_DIR)/app.html
	perl -i -p -e 's/\s*<\/head/    <link href="app.css" rel="stylesheet">\n  <\/head/' $(BUILD_DIR)/app.html
	perl -i -p -e 's/\s*<script[^>]+><\/script>\n//g' $(BUILD_DIR)/app.html
	perl -i -p -e 's/\s*<\/body>/    <script src="app.js"><\/script>\n  <\/body>/' $(BUILD_DIR)/app.html

$(BUILD_DIR)/app.js: $(JS)
	cat $(JS) > $(BUILD_DIR)/app.js

$(BUILD_DIR)/app.css: $(CSS)
	cat $(CSS) > $(BUILD_DIR)/app.css

.PHONY: clean

clean:
	rm $(BUILD_DIR)/*
