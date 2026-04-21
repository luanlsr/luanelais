-- SEED: PRODUCTS / GIFTS LIST
-- Initial gift items for the wedding portal.

INSERT INTO lista_presentes (wedding_id, title, image_url, price, buy_url)
VALUES (
  'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 
  'Electrolux Air Fryer Forno 5 em 1 12L 1700W', 
  'https://m.media-amazon.com/images/I/51zqocFSQSL._AC_SL1000_.jpg', 
  616.55, 
  'https://www.amazon.com.br/Electrolux-Antiaderente-Receitas-Programadas-Fritadeira/dp/B0FRHHNVLV/ref=asc_df_B0FRHHNVLV?mcid=18ba4908d60233aa871a7cfee7d3f502&tag=googleshopp00-20&linkCode=df0&hvadid=773067503959&hvpos=&hvnetw=g&hvrand=17563391352498644587&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9197850&hvtargid=pla-2443197618423&hvocijid=17563391352498644587-B0FRHHNVLV-&hvexpln=0&language=pt_BR&th=1'
)
ON CONFLICT (id) DO NOTHING;
