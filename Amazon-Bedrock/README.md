# 🚀 Amazon Bedrock AI Chat Application

A Python application that demonstrates how to interact with Amazon Bedrock's AI models, specifically using Anthropic's Claude for text generation with real-time streaming responses.

## 📋 Overview

This application showcases how to:
- 🤖 Connect to Amazon Bedrock Runtime API
- 💬 Send prompts to Claude AI models
- 📡 Stream responses in real-time
- 🔐 Securely manage AWS credentials using environment variables

## 🎥 Tutorial Video

📺 **Watch the complete setup and usage guide**: [Amazon Bedrock Tutorial](https://www.youtube.com/watch?v=MpLzS7uJhBc)

🔔 **Subscribe to my YouTube channel for more AI & coding tutorials**: [Tamilan AI Channel](https://www.youtube.com/channel/UCQLbJH7MraL2Z74Kt2j2OVA)

## 📁 Project Structure

```
Amazon-Bedrock/
├── test_bedrock.py      # Main application file
├── requirements.txt     # Python dependencies
├── .gitignore          # Git ignore rules
├── .env               # Environment variables (create this)
└── README.md          # This file
```

## 🛠️ Prerequisites

Before running this application, ensure you have:

- 🐍 Python 3.7 or higher installed
- 🔑 AWS account with Bedrock access
- 📝 AWS credentials (Access Key ID and Secret Access Key)
- 🌍 AWS region where Bedrock is available

## ⚙️ Installation

1. **Clone or download the project**
   ```bash
   cd Amazon-Bedrock
   ```

2. **Install required dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create environment file**
   Create a `.env` file in the project root with your AWS credentials:
   ```env
   ACCESS_KEY_ID=your_aws_access_key_id
   SECRET_ACCESS_KEY=your_aws_secret_access_key
   REGION=us-east-1
   ```

## 🚀 How to Run

1. **Set up your environment variables**
   Make sure your `.env` file contains valid AWS credentials

2. **Run the application**
   ```bash
   python test_bedrock.py
   ```

3. **View the output**
   The application will stream Claude's response about Sachin Tendulkar in real-time

## 🔧 Configuration

### Model Settings
- **Model**: `us.anthropic.claude-sonnet-4-20250514-v1:0`
- **Max Tokens**: 512
- **Temperature**: 0.5 (controls randomness)

### Customization
You can modify the following in `test_bedrock.py`:
- Change the `prompt` variable to ask different questions
- Adjust `max_tokens` for longer/shorter responses
- Modify `temperature` (0.0-1.0) for more/less creative responses

## 📚 Dependencies

The application uses these Python packages:
- `boto3` - AWS SDK for Python
- `python-dotenv` - Load environment variables from .env file

## 🔐 Security Notes

- ⚠️ Never commit your `.env` file to version control
- 🔒 Use IAM roles with minimal required permissions
- 🛡️ Regularly rotate your AWS credentials
- 📋 The `.gitignore` file already excludes `.env` files

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Error**
   - Verify your AWS credentials in the `.env` file
   - Ensure your AWS account has Bedrock access

2. **Region Error**
   - Make sure Bedrock is available in your specified region
   - Try using `us-east-1` or `us-west-2`

3. **Model Access Error**
   - Request access to Claude models in the AWS Bedrock console
   - Wait for approval (can take some time)

## 🎯 Next Steps

- 🔄 Modify the prompt to ask different questions
- 🎨 Add a web interface using Flask or FastAPI
- 💾 Save responses to a file or database
- 🔀 Try different Claude models or other Bedrock models

## 📖 Learn More

- 🎥 [Tutorial Video](https://www.youtube.com/watch?v=MpLzS7uJhBc)
- 🔔 [Subscribe to Tamilan AI Channel](https://www.youtube.com/channel/UCQLbJH7MraL2Z74Kt2j2OVA)
- 📚 [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- 🤖 [Anthropic Claude Documentation](https://docs.anthropic.com/)

## 📄 License

This project is for educational purposes. Please follow AWS and Anthropic's terms of service.

---

💡 **Tip**: Watch the tutorial video linked above for a complete walkthrough of setting up and running this application!