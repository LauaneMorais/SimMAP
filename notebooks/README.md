# Notebooks

`simmap_data_exploration.ipynb` consolida os dados do SimMAP a partir de arquivos locais:

- `data/mapeamento-forms/Mapeamento de Membros LAWD (respostas).csv`
- `data/notion-lawd/*.csv`
- `data/notion-projetos/*.csv`

Ao final da execução, o notebook atualiza `../db/db.json` com:

- `membros`
- `projetos`
- `analises`
