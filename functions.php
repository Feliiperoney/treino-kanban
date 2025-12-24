<?php
// functions.php - Funções auxiliares para o sistema de treinos

/**
 * Converte status para texto em português
 */
function traduzirStatus($status) {
    $statusMap = [
        'pendente' => 'Pendente',
        'andamento' => 'Em Andamento',
        'concluido' => 'Concluído'
    ];
    return $statusMap[$status] ?? $status;
}

/**
 * Formata data para exibição
 */
function formatarData($dataString) {
    $data = new DateTime($dataString);
    return $data->format('d/m/Y H:i');
}

/**
 * Calcula próxima recorrência
 */
function calcularProximaRecorrencia($dataInicio, $recorrencia) {
    $data = new DateTime($dataInicio);
    
    if ($recorrencia == 1) {
        $data->modify('+7 days'); // Semanal
    } elseif ($recorrencia == 2) {
        $data->modify('+14 days'); // Quinzenal
    }
    
    return $data->format('Y-m-d H:i:s');
}

/**
 * Gera ID único para treinos
 */
function gerarIdUnico() {
    return uniqid('treino_', true);
}

echo "✅ Arquivo functions.php criado com funções auxiliares";
?>