.PHONY: all
.DEFAULT: all
all: _book/index.epub _book/index.pdf

_book/index.epub: *.md
	gitbook build . --format ebook # --cover <path>

_book/index.pdf: *.md
	gitbook build . --format pdf
