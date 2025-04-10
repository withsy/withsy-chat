import type { ChatMessage } from "@/types/chat";

const messages: ChatMessage[] = [
  {
    id: "msg1",
    chatId: "chat-002",
    userId: "user-001",
    isAI: false,
    content:
      "Can you show me a comparison between Kubernetes and Docker Swarm?",
    createdAt: "2025-04-09T10:00:00Z",
  },
  {
    id: "msg2",
    chatId: "chat-002",
    isAI: true,
    model: "gpt-3.5",
    content: `
Sure! Here's a quick comparison:

| Feature           | Kubernetes         | Docker Swarm       |
|------------------|--------------------|---------------------|
| Complexity        | High               | Low                 |
| Scalability       | Excellent          | Good                |
| Community Support | Strong             | Moderate            |
| Setup Time        | Longer             | Shorter             |
| Learning Curve    | Steep              | Gentle              |

Let me know if you'd like to see a YAML example as well.
    `,
    createdAt: "2025-04-09T10:00:04Z",
    usage: {
      promptTokens: 30,
      completionTokens: 100,
      totalTokens: 130,
    },
  },
  {
    id: "msg3",
    chatId: "chat-002",
    userId: "user-001",
    isAI: false,
    content:
      "Yes, please show a sample YAML for a basic Kubernetes deployment.",
    createdAt: "2025-04-09T10:01:00Z",
  },
  {
    id: "msg4",
    chatId: "chat-002",
    isAI: true,
    model: "gpt-4",
    content: `
Absolutely! Here's an example of a basic Kubernetes Deployment YAML:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
\`\`\`

This will create a Deployment that runs 3 replicas of an Nginx pod.

Let me know if you'd like to include a Service to expose it!
    `,
    createdAt: "2025-04-09T10:01:06Z",
    usage: {
      promptTokens: 40,
      completionTokens: 140,
      totalTokens: 180,
    },
  },
  {
    id: "msg5",
    chatId: "chat-002",
    isAI: true,
    model: "system",
    content: "You switched to GPT-4 for this conversation.",
    createdAt: "2025-04-09T10:01:08Z",
  },
  {
    id: "msg6",
    chatId: "chat-002",
    userId: "user-001",
    isAI: false,
    content: "Can you show how to expose the deployment using a LoadBalancer?",
    createdAt: "2025-04-09T10:02:00Z",
    parentId: "msg4",
  },
  {
    id: "msg7",
    chatId: "chat-002",
    isAI: true,
    model: "gpt-4",
    content: `
Sure! Here's how you can expose your Deployment using a LoadBalancer Service:

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
\`\`\`

This will provision an external IP (depending on your cloud provider) and route traffic to your pods.
    `,
    createdAt: "2025-04-09T10:02:05Z",
    parentId: "msg6",
    usage: {
      promptTokens: 35,
      completionTokens: 120,
      totalTokens: 155,
    },
  },
  {
    id: "msg8",
    chatId: "chat-002",
    userId: "user-001",
    isAI: false,
    content: "Thanks, that was super helpful! 😊",
    createdAt: "2025-04-09T10:03:00Z",
  },
];

export default messages;
