import { Configuration, OpenAIApi } from 'openai';

export const summarizer = async (
  chunks: string[],
): Promise<{ summary: string; topics: string[] }> => {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(config);

  let summaries: string[] = [];

  for (const chunk of chunks) {
    const summarizeResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Isso é uma transcrição de um vídeo do YouTube.',
        },
        {
          role: 'user',
          content: `Se estiver em outro idioma traduza para pt-BR e resuma detalhadamente isso para um aluno do segundo grau: ${chunk}`,
        },
      ],
    });

    summaries = [
      ...summaries,
      summarizeResponse.data?.choices[0]?.message?.content as string,
    ];
  }

  const consolidateResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Isso é um resumo de um vídeo do YouTube.',
      },
      {
        role: 'user',
        content: `Consolide o resumo abaixo no formato JSON usando a chave summary e consolide em 3 principais tópicos mais importantes do vídeo na chave topics:\n${summaries.join(
          '\n',
        )}`,
      },
    ],
  });

  const summaryConsolidated = JSON.parse(
    consolidateResponse.data?.choices[0]?.message?.content as string,
  );

  return {
    summary: summaryConsolidated?.summary,
    topics: summaryConsolidated?.topics,
  };
};
