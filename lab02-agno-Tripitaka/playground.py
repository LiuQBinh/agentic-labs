from agno.agent import Agent
from agno.models.lmstudio import LMStudio
from agno.playground import Playground
from agno.storage.sqlite import SqliteStorage
from agno.playground.settings import PlaygroundSettings
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.yfinance import YFinanceTools

agent_storage: str = "tmp/agents.db"

web_agent = Agent(
    name="Web Agent",
    model=LMStudio(id="claude-3.7-sonnet-reasoning-gemma3-12b"),
    tools=[DuckDuckGoTools()],
    instructions=["Luôn luôn bao gồm nguồn tham khảo"],
    # Store the agent sessions in a sqlite database
    storage=SqliteStorage(table_name="web_agent", db_file=agent_storage),
    # Adds the current date and time to the instructions
    add_datetime_to_instructions=True,
    # Adds the history of the conversation to the messages
    add_history_to_messages=True,
    # Number of history responses to add to the messages
    num_history_responses=5,
    # Adds markdown formatting to the messages
    markdown=True,
)

finance_agent = Agent(
    name="Finance Agent",
    model=LMStudio(id="claude-3.7-sonnet-reasoning-gemma3-12b"),
    tools=[YFinanceTools(stock_price=True, analyst_recommendations=True, company_info=True, company_news=True)],
    instructions=["Luôn luôn sử dụng bảng để hiển thị dữ liệu"],
    storage=SqliteStorage(table_name="finance_agent", db_file=agent_storage),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)

playground_app = Playground(agents=[web_agent, finance_agent], settings=PlaygroundSettings(env='dev'))
app = playground_app.get_app()

if __name__ == "__main__":
    playground_app.serve("playground:app", reload=True)