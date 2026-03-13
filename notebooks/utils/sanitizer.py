import re
import unicodedata
import pandas as pd
from pandas.api.types import is_scalar


def is_missing_scalar(value):
    """Return True only for scalar missing values (None/NaN/NaT)."""
    return is_scalar(value) and pd.isna(value)

def remove_links(value):
    if is_missing_scalar(value):
        return value
    # Remove links e parênteses, mantendo apenas o texto principal.
    return re.sub(r"\s*\(https?://[^)]+\)", "", value)


def sanitize_string(value):
    if is_missing_scalar(value):
        return value

    # Normaliza para remover acentos e unifica variações unicode.
    normalized = unicodedata.normalize("NFKD", str(value))
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))

    # Mantém apenas letras/números/espaços, remove caracteres especiais,
    # comprime espaços e converte para caixa alta.
    cleaned = re.sub(r"[^A-Za-z0-9\s]", "", without_accents)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned.upper()


def sanitize_project_string(value):
    """Normalize project names while preserving '.' and '-' separators."""
    if is_missing_scalar(value):
        return value

    normalized = unicodedata.normalize("NFKD", str(value))
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))

    # Keep letters, numbers, spaces, dots and hyphens for project keys.
    cleaned = re.sub(r"[^A-Za-z0-9.\-\s]", "", without_accents)
    cleaned = re.sub(r"\s*\.\s*", ".", cleaned)
    cleaned = re.sub(r"\s*-\s*", " - ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned.upper()


def split_participantes(value):
    """Split project participant fields into a clean list of names."""
    if is_missing_scalar(value):
        return []

    parts = [p.strip() for p in re.split(r"[;,\n]", str(value))]
    return [p for p in parts if p]


def build_nome_lookup(df, nome_col="Nome Completo", nome_original_col="Nome Completo Original"):
    """Build mapping: sanitized aliases -> canonical Nome Completo."""
    validos = (
        df[[nome_col, nome_original_col]]
        .dropna(subset=[nome_col])
        .drop_duplicates(subset=[nome_col])
        .copy()
    )
    validos["_nome_original_sanitizado"] = validos[nome_original_col].apply(sanitize_string)

    return {
        **dict(zip(validos["_nome_original_sanitizado"], validos[nome_col])),
        **dict(zip(validos[nome_col], validos[nome_col])),
    }


def normalizar_participante(nome, nome_lookup):
    """Resolve participant name to canonical Nome Completo using lookup and prefix fallback."""
    nome_sanitizado = sanitize_string(nome)
    if is_missing_scalar(nome_sanitizado):
        return None

    if nome_sanitizado in nome_lookup:
        return nome_lookup[nome_sanitizado]

    candidatos = [
        canonico
        for chave, canonico in nome_lookup.items()
        if chave.startswith(nome_sanitizado) or nome_sanitizado.startswith(chave)
    ]
    candidatos = list(dict.fromkeys(candidatos))
    if len(candidatos) == 1:
        return candidatos[0]

    return None


def split_comma_string(value):
    """Convert comma-separated strings into list values."""
    if isinstance(value, list) or is_missing_scalar(value):
        return value
    if isinstance(value, str) and "," in value:
        return [item.strip() for item in value.split(",") if item.strip()]
    return value


def convert_comma_strings_to_lists(df):
    """Apply comma-string to list conversion on all text columns."""
    df = df.copy()
    text_cols = df.select_dtypes(include=["object", "string"]).columns
    for col in text_cols:
        df[col] = df[col].apply(split_comma_string)
    return df


def _to_list_value(value):
    """Normalize scalar/list cell values into a clean list of strings."""
    if is_missing_scalar(value):
        return []
    if isinstance(value, list):
        return [item for item in value if not is_missing_scalar(item) and str(item).strip()]
    if isinstance(value, str):
        if "," in value:
            return [item.strip() for item in value.split(",") if item.strip()]
        return [value] if value.strip() else []
    return [value]


def merge_dataframe_columns_values(
    df,
    left_col,
    right_col,
    target_col=None,
    drop_source_columns=False,
):
    """Merge two columns from the same DataFrame into a single deduplicated list column."""
    if left_col not in df.columns or right_col not in df.columns:
        missing = [c for c in [left_col, right_col] if c not in df.columns]
        raise KeyError(f"Coluna(s) ausente(s): {missing}")

    target_col = target_col or left_col
    result = df.copy()

    def merge_row(row):
        merged = _to_list_value(row[left_col]) + _to_list_value(row[right_col])
        # Preserve first occurrence order while removing duplicates.
        return list(dict.fromkeys(str(item).strip() for item in merged if str(item).strip()))

    result[target_col] = result.apply(merge_row, axis=1)

    if drop_source_columns:
        cols_to_drop = [c for c in [left_col, right_col] if c != target_col and c in result.columns]
        if cols_to_drop:
            result = result.drop(columns=cols_to_drop)

    return result


def build_project_series(
    df_projetos,
    nome_lookup,
    project_col="Nome do Projeto",
    time_col="Time",
    responsavel_col="Responsável",
    status_col="Status",
):
    """Build project-related series keyed by canonical Nome Completo."""
    atuais = df_projetos[[project_col, time_col, status_col]].copy()
    atuais["Nome Completo"] = atuais[time_col].apply(split_participantes)
    atuais = atuais.explode("Nome Completo", ignore_index=True)
    atuais["Nome Completo"] = atuais["Nome Completo"].apply(
        lambda nome: normalizar_participante(nome, nome_lookup)
    )
    atuais = atuais.dropna(subset=["Nome Completo"])
    atuais["Status Normalizado"] = atuais[status_col].apply(sanitize_string)

    projetos_atuais = (
        atuais.groupby("Nome Completo")[project_col]
        .apply(lambda s: sorted(set(s.dropna())))
        .rename("Projetos Atuais")
    )

    projetos_finalizados = (
        atuais[atuais["Status Normalizado"] == "FINALIZADO"]
        .groupby("Nome Completo")[project_col]
        .apply(lambda s: sorted(set(s.dropna())))
        .rename("Projetos Finalizados")
    )

    projetos_atuais_em_andamento = (
        atuais[atuais["Status Normalizado"] == "EM ANDAMENTO"]
        .groupby("Nome Completo")[project_col]
        .apply(lambda s: sorted(set(s.dropna())))
        .rename("Projetos Atuais Em Andamento")
    )

    coordenados = df_projetos[[project_col, responsavel_col]].copy()
    coordenados["Nome Completo"] = coordenados[responsavel_col].apply(split_participantes)
    coordenados = coordenados.explode("Nome Completo", ignore_index=True)
    coordenados["Nome Completo"] = coordenados["Nome Completo"].apply(
        lambda nome: normalizar_participante(nome, nome_lookup)
    )
    coordenados = coordenados.dropna(subset=["Nome Completo"])

    projetos_coordenados = (
        coordenados.groupby("Nome Completo")[project_col]
        .apply(lambda s: sorted(set(s.dropna())))
        .rename("Projetos Coordenados")
    )

    return {
        "Projetos Atuais": projetos_atuais,
        "Projetos Finalizados": projetos_finalizados,
        "Projetos Atuais Em Andamento": projetos_atuais_em_andamento,
        "Projetos Coordenados": projetos_coordenados,
    }


def normalize_project_key(value, aliases=None):
    """Return canonical project key (upper/no accents/trim) with optional aliases."""
    if is_missing_scalar(value):
        return value

    key = sanitize_project_string(str(value).strip())
    if aliases is None:
        return key

    alias_map = {
        sanitize_project_string(k): sanitize_project_string(v)
        for k, v in aliases.items()
    }
    return alias_map.get(key, key)


def project_match_key(value):
    """Build a looser project key for tolerant matching (e.g. DA/DO variations)."""
    normalized = sanitize_project_string(value)
    if is_missing_scalar(normalized):
        return normalized

    # Ignore separator differences (dot/hyphen/space) when matching variants.
    normalized = normalized.replace(".", " ").replace("-", " ")

    # Remove common Portuguese stopwords that vary in user-entered project names.
    tokens = [t for t in str(normalized).split() if t not in {"DA", "DO", "DE", "DAS", "DOS"}]
    return " ".join(tokens)


def resolve_project_name(value, canonical_lookup, loose_lookup, aliases=None):
    """Resolve a project label to canonical df_projetos naming when possible."""
    normalized = normalize_project_key(value, aliases=aliases)
    if is_missing_scalar(normalized):
        return normalized

    if normalized in canonical_lookup:
        return canonical_lookup[normalized]

    loose_key = project_match_key(normalized)
    candidates = loose_lookup.get(loose_key, [])
    if len(candidates) == 1:
        return candidates[0]

    return normalized


def normalize_project_collection(
    value,
    canonical_lookup,
    loose_lookup,
    aliases=None,
    unmatched=None,
):
    """Normalize a project value that may be a list, comma-string or scalar."""
    if is_missing_scalar(value):
        return value

    if isinstance(value, list):
        normalized_items = []
        for item in value:
            if not str(item).strip():
                continue
            resolved = resolve_project_name(item, canonical_lookup, loose_lookup, aliases=aliases)
            normalized_items.append(resolved)
            if unmatched is not None and resolved == normalize_project_key(item, aliases=aliases):
                if resolved not in canonical_lookup:
                    unmatched.add(str(item))
        return normalized_items

    if isinstance(value, str) and "," in value:
        parts = [item.strip() for item in value.split(",") if item.strip()]
        normalized_parts = []
        for item in parts:
            resolved = resolve_project_name(item, canonical_lookup, loose_lookup, aliases=aliases)
            normalized_parts.append(resolved)
            if unmatched is not None and resolved == normalize_project_key(item, aliases=aliases):
                if resolved not in canonical_lookup:
                    unmatched.add(str(item))
        return normalized_parts

    resolved = resolve_project_name(value, canonical_lookup, loose_lookup, aliases=aliases)
    if unmatched is not None and resolved == normalize_project_key(value, aliases=aliases):
        if resolved not in canonical_lookup:
            unmatched.add(str(value))
    return resolved


def standardize_project_keys(
    df_projetos,
    df,
    project_col="Nome do Projeto",
    df_project_columns=None,
    aliases=None,
    report_unmatched=False,
):
    """Standardize project keys while preserving original project names in parallel columns."""
    df_projetos = df_projetos.copy()
    df = df.copy()

    original_project_col = f"{project_col} Original"
    if original_project_col not in df_projetos.columns:
        df_projetos[original_project_col] = df_projetos[project_col]

    df_projetos[project_col] = df_projetos[project_col].apply(
        lambda v: normalize_project_key(v, aliases=aliases)
    )

    # Build authoritative mapping from official project entries in df_projetos.
    canonical_lookup = {}
    loose_lookup = {}
    for _, row in df_projetos[[original_project_col, project_col]].dropna(subset=[project_col]).iterrows():
        canonical = row[project_col]
        canonical_lookup[canonical] = canonical

        original_normalized = normalize_project_key(row[original_project_col], aliases=aliases)
        if not is_missing_scalar(original_normalized):
            canonical_lookup[original_normalized] = canonical

        loose_key = project_match_key(row[original_project_col])
        if not is_missing_scalar(loose_key):
            loose_lookup.setdefault(loose_key, set()).add(canonical)

    loose_lookup = {k: sorted(v) for k, v in loose_lookup.items()}

    if df_project_columns is None:
        df_project_columns = [
            "Projetos Atuais",
            "Projetos Atuais Em Andamento",
            "Projetos Finalizados",
            "Projetos Coordenados",
            "Projetos com Interesse",
        ]

    unmatched_projects = set()
    for col in df_project_columns:
        if col not in df.columns:
            continue

        original_col = f"{col} Original"
        # Keep original project names only in df_projetos.
        if original_col in df.columns:
            df = df.drop(columns=[original_col])

        df[col] = df[col].apply(
            lambda v: normalize_project_collection(
                v,
                canonical_lookup=canonical_lookup,
                loose_lookup=loose_lookup,
                aliases=aliases,
                unmatched=unmatched_projects,
            )
        )

    if report_unmatched and unmatched_projects:
        print("Projetos sem correspondencia com o padrao de df_projetos:")
        print(sorted(unmatched_projects))

    return df_projetos, df


def tratar_dataframe_notion(df, colunas_para_remover=None, colunas_com_links=None):
    # Unifica pares de colunas com sufixo _x/_y e remove os sufixos.
    for col in list(df.columns):
        if col.endswith("_x"):
            base_col = col[:-2]
            y_col = f"{base_col}_y"
            if y_col in df.columns:
                df[base_col] = df[col].combine_first(df[y_col])
            else:
                df[base_col] = df[col]

    # Remove colunas com sufixo restantes (_x/_y) e nomes duplicados.
    df = df.loc[:, ~df.columns.str.endswith(("_x", "_y"))]
    df = df.loc[:, ~df.columns.duplicated()]

    if colunas_para_remover is not None and len(colunas_para_remover) > 0:
        df = df.drop(columns=colunas_para_remover, errors="ignore")

    # Remove links apenas nas colunas de texto informadas.
    if colunas_com_links is not None and len(colunas_com_links) > 0:
        for col in colunas_com_links:
            if col in df.columns:
                df[col] = df[col].apply(remove_links)

    return df
