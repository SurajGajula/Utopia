using UnityEngine;

public class StartBattle : MonoBehaviour
{
    public Player player;
    public Stats[] enemyFabs;
    public Stats[] enemies;
    public Stats[] allyFabs;
    public Stats[] allies;
    public Healthbar[] allybars;
    public Healthbar[] enemybars;
    public Battle battleUI;
    public void BattleStart()
    {
        player.canMove = false;
        player.transform.position = new Vector3(transform.position.x - 8, 0, 0);
        player.camera.transform.position = new Vector3(transform.position.x - 2, 1, -10);
        player.gameObject.SetActive(false);
        for (int i = 0; i < 3; i++)
        {
            GameObject einstance = Instantiate(enemyFabs[i].gameObject, this.transform.position + new Vector3(3 * i, -1, 0), Quaternion.identity);
            enemies[i] = einstance.GetComponent<Stats>();
            GameObject ainstance = Instantiate(allyFabs[i].gameObject, player.transform.position + new Vector3(-2 * (i - 1), 0, 0), Quaternion.identity);
            allies[i] = ainstance.GetComponent<Stats>();
            allybars[i].maxHealth = allies[i].health;
            enemybars[i].maxHealth = enemies[i].health;
        }
        this.gameObject.SetActive(false);
        battleUI.gameObject.SetActive(true);
        battleUI.enemies = enemies;
        battleUI.allies = allies;
        battleUI.allybars = allybars;
        battleUI.enemybars = enemybars;
        battleUI.canSkill = true;
    }
}
