from agno.agent import Agent, RunResponse
from agno.models.lmstudio import LMStudio
from agno.tools.yfinance import YFinanceTools

agent = Agent(
    model=LMStudio(id="claude-3.7-sonnet-reasoning-gemma3-12b"),
    tools=[YFinanceTools(stock_price=True)],
    description="Share 15 minute healthy recipes.",
    markdown=True,
)
agent.print_response("What is the stock price of Apple?", stream=True)
