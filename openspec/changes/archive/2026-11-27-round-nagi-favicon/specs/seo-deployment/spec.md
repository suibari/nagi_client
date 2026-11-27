# ブラウザ用 favicon の差分仕様

## ADDED Requirements

### Requirement: SEO-09 Nagi Space と揃えた favicon の角丸

Nagi のブラウザ用 favicon は Nagi の絵柄を保ち、四隅が透明な角丸の正方形でなければならない（MUST）。角丸半径は Nagi Space の基準と同じ、画像の一辺の 21.875% とする。

#### Scenario: ブラウザで Nagi を開く

- **WHEN** ブラウザが Nagi のページを開き、HTML が指定する favicon を取得する
- **THEN** ブラウザが Nagi の絵柄を表示でき、四隅の透明部分による角丸が Nagi Space と同じ比率になる
